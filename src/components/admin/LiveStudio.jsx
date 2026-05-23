import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axiosInstance from '../../utils/axios';
import { Link } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './AdminStyles.css';

const LiveStudio = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const clientRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoContainerRef = useRef(null);
  
  // Chat & Viewer State
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let isActive = true;
    // Connect STOMP to track viewers and see chats
    // Use relative path to correctly push through React proxy and avoid mixed content over HTTPS
    const socket = new SockJS('/api/ws-live');
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect({}, () => {
      if (!isActive) {
         stompClient.disconnect();
         return;
      }

      // Only listen for chat -- admin does NOT register as a viewer
      stompClient.subscribe('/topic/live.chat', (msg) => {
        const newMsg = JSON.parse(msg.body);
        // Ignore messages from Admin to prevent duplicates (we add them locally on send)
        if (newMsg.senderName !== 'Admin') {
          setMessages((prev) => [...prev, newMsg]);
        }
      });
      
      stompClient.subscribe('/topic/live.viewers', (msg) => {
        // Admin does NOT send a JOIN event, so count is already accurate
        const count = parseInt(msg.body, 10);
        setViewerCount(count);
      });
    });

    stompClientRef.current = stompClient;

    return () => {
      // Cleanup on unmount
      isActive = false;
      if (clientRef.current) leaveChannel();
      if (stompClient.connected) stompClient.disconnect();
    };
  }, []);

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !stompClientRef.current?.connected) return;

    const chatMsg = {
      senderName: 'Admin',
      message: chatInput.trim(),
      type: 'CHAT'
    };

    // Add to local state immediately (don't wait for broadcast to avoid duplicate)
    setMessages((prev) => [...prev, { ...chatMsg, timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }]);
    stompClientRef.current.send("/app/live.chat.send", {}, JSON.stringify(chatMsg));
    setChatInput('');
  };

  const toggleMute = () => {
    if (!localAudioTrackRef.current) return;
    const newMuted = !isMuted;
    localAudioTrackRef.current.setMuted(newMuted);
    setIsMuted(newMuted);
  };

  const toggleVideo = () => {
    if (!localVideoTrackRef.current) return;
    const newVideoOff = !isVideoOff;
    localVideoTrackRef.current.setMuted(newVideoOff);
    setIsVideoOff(newVideoOff);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
        await axiosInstance.post('/api/auth/logout');
        window.location.href = '/login';
    } catch (err) {
        console.error('Logout error:', err);
        window.location.href = '/login';
    }
  };

  const initializeAndJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch token and App ID from our secure backend with ROLE=1 (Publisher)
      const response = await axiosInstance.get('/video/token?channelName=anvi_studio_live&role=1');
      const { appId, token, channel, uid } = response.data;

      // 2. Create local tracks (Camera & Mic) - Default to front camera
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        { facingMode: 'user' }
      );
      setFacingMode('user');
      localAudioTrackRef.current = audioTrack;
      localVideoTrackRef.current = videoTrack;

      // 3. Play local video in the container
      if (localVideoContainerRef.current) {
        videoTrack.play(localVideoContainerRef.current);
      }

      // 4. Initialize Agora Client as a Host
      clientRef.current = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      await clientRef.current.setClientRole("host");

      // 5. Join the channel
      await clientRef.current.join(appId, channel, token, uid);
      setIsJoined(true);

    } catch (err) {
      console.error("Failed to initialize Live Studio:", err);
      
      let errorMessage = "Failed to access camera/microphone or connect to Agora. Please check your permissions.";
      if (window.isSecureContext === false) {
        errorMessage = "Camera access blocked by your browser. Mobile browsers require a secure HTTPS connection or 'localhost' to access hardware. Please use an HTTPS tunnel (like ngrok) for local network testing.";
      } else if (err && err.message) {
        errorMessage += ` Details: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Cleanup tracks if they were created but joining failed
      if (localAudioTrackRef.current) localAudioTrackRef.current.close();
      if (localVideoTrackRef.current) localVideoTrackRef.current.close();
    } finally {
      setLoading(false);
    }
  };

  const publishStream = async () => {
    if (!clientRef.current || !localAudioTrackRef.current || !localVideoTrackRef.current) return;
    
    setLoading(true);
    try {
      await clientRef.current.publish([localAudioTrackRef.current, localVideoTrackRef.current]);
      setIsPublishing(true);
    } catch (err) {
      console.error("Failed to publish stream:", err);
      setError("Failed to start broadcasting.");
    } finally {
      setLoading(false);
    }
  };

  const stopPublishing = async () => {
    if (!clientRef.current) return;
    setLoading(true);
    try {
      await clientRef.current.unpublish([localAudioTrackRef.current, localVideoTrackRef.current]);
      setIsPublishing(false);
    } catch (err) {
      console.error("Failed to stop publishing:", err);
    } finally {
      setLoading(false);
    }
  };

  const switchCamera = async () => {
    if (!localVideoTrackRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      
      // 1. Create the new video track with the opposite facing mode
      const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
        facingMode: newFacingMode
      });

      // 2. If we are currently ON AIR, we need to replace the track on the client
      if (isPublishing && clientRef.current) {
        // Unpublish the old and publish the new
        await clientRef.current.unpublish(localVideoTrackRef.current);
        await clientRef.current.publish(newVideoTrack);
      }

      // 3. Stop and close the old track to release hardware
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();

      // 4. Update the reference and play the new feed in the studio preview
      localVideoTrackRef.current = newVideoTrack;
      if (localVideoContainerRef.current) {
         newVideoTrack.play(localVideoContainerRef.current);
      }

      // 5. Update state so we know what to toggle next time
      setFacingMode(newFacingMode);
      console.log(`Switched to ${newFacingMode} camera`);
    } catch (err) {
      console.error("Failed to switch camera:", err);
      setError("Failed to switch camera. Please ensure you have granted permissions for all cameras.");
    } finally {
      setLoading(false);
    }
  };

  const leaveChannel = async () => {
    setLoading(true);
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
      setIsJoined(false);
      setIsPublishing(false);
    } catch (err) {
      console.error("Error leaving channel:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex admin-layout" style={{ minHeight: '100vh' }}>
      {/* Admin Sidebar */}
      <div className="bg-dark text-white p-3 admin-sidebar" style={{ width: '250px' }}>
        <h4 className="text-center mb-4 mt-2" style={{ fontFamily: 'Playfair Display' }}>Anvi Studio<br/><span className="fs-6 fw-normal text-white-50">Admin Control</span></h4>
        <div className="nav flex-column nav-pills">
          <Link to="/admin/dashboard" className="nav-link text-white mb-2"><i className="fa fa-box me-2"></i> Catalog</Link>
          <Link to="/admin/orders" className="nav-link text-white mb-2"><i className="fa fa-shopping-bag me-2"></i> Orders</Link>
          <Link to="/admin/reviews/moderate" className="nav-link text-white mb-2"><i className="fa fa-star me-2"></i> Reviews</Link>
          <Link to="/admin/contacts" className="nav-link text-white mb-2"><i className="fa fa-envelope me-2"></i> Messages</Link>
          <Link to="/admin/live-studio" className="nav-link text-white mb-2 active bg-brand" style={{ backgroundColor: '#ff7c04' }}><i className="fas fa-broadcast-tower me-2"></i> Live Studio</Link>
          <hr className="border-secondary mx-3 my-2" />
          <Link to="/admin/profile" className="nav-link text-white mb-2"><i className="fa fa-user-cog me-2"></i> My Account</Link>
          <a href="#" className="nav-link text-white mb-2" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Logout</a>
        </div>
        <div className="mt-auto p-3 position-absolute bottom-0 w-100" style={{ maxWidth: '240px' }}>
            <Link to="/" className="btn btn-outline-light btn-sm w-100">View Site</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-2 p-md-4 bg-light overflow-x-hidden">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 mb-md-4 gap-2">
          <h2 className="fs-3 fs-md-2 mb-0"><i className="fas fa-broadcast-tower text-brand me-2" style={{ color: '#ff7c04' }}></i> Live Broadcast</h2>
          <div className="d-flex align-items-center gap-2">
             <span className="badge bg-dark rounded-pill px-2 px-md-3 py-1 py-md-2 fs-7 fs-md-6 text-nowrap">
                <i className="fas fa-eye text-brand me-1"></i> {viewerCount} Viewers
             </span>
             {isPublishing && (
                <span className="badge bg-danger pulse-badge rounded-pill px-2 px-md-3 py-1 py-md-2 fs-7 fs-md-6 text-nowrap"><i className="fas fa-circle me-1 small"></i> ON AIR</span>
             )}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4 shadow-sm border-0"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>
        )}

        <div className="row g-3 gap-3 gap-lg-0">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0 mb-4 overflow-hidden bg-dark position-relative">
              {/* Parent container for video and UI */}
              <div 
                className="w-100 bg-black d-flex align-items-center justify-content-center position-relative"
                style={{ height: '500px' }}
              >
                {/* Dedicated Video Canvas - Agora will use this exclusively */}
                <div ref={localVideoContainerRef} className="w-100 h-100"></div>

                {/* React-managed UI Elements (Safe from manual DOM clearing) */}
                {!isJoined && !loading && (
                   <div className="text-white text-center opacity-50 position-absolute">
                      <i className="fas fa-video-slash fs-1 mb-3"></i>
                      <h5>Camera Offline</h5>
                   </div>
                )}
                {loading && (
                   <div className="spinner-border text-light position-absolute" role="status"></div>
                )}
                
                {isJoined && !loading && (
                  <div className="position-absolute d-flex gap-2" style={{ zIndex: 100, bottom: '12px', right: '12px' }}>
                    <button 
                      className="flip-camera-btn" 
                      title={isMuted ? 'Unmute' : 'Mute'} 
                      onClick={toggleMute}
                      style={{ backgroundColor: isMuted ? 'rgba(220,53,69,0.85)' : 'rgba(0,0,0,0.55)' }}
                    >
                      <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                    </button>
                    <button 
                      className="flip-camera-btn" 
                      title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'} 
                      onClick={toggleVideo}
                      style={{ backgroundColor: isVideoOff ? 'rgba(220,53,69,0.85)' : 'rgba(0,0,0,0.55)' }}
                    >
                      <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
                    </button>
                    <button 
                      className="flip-camera-btn" 
                      title="Switch Camera" 
                      onClick={switchCamera}
                    >
                      <i className="fas fa-camera-rotate"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold border-bottom pb-2 mb-3">Studio Controls</h5>
                
                <p className="text-muted small mb-3">
                  When you are ready, turn on your camera and microphone, then start broadcasting to go live on the storefront.
                </p>

                <div className="d-grid gap-2 mt-auto">
                  {!isJoined ? (
                    <button 
                      className="btn btn-dark py-3 fw-bold" 
                      onClick={initializeAndJoin}
                      disabled={loading}
                    >
                      <i className="fas fa-video me-2"></i> Turn On Camera & Mic
                    </button>
                  ) : (
                    <>
                      {!isPublishing ? (
                        <button 
                          className="btn btn-success py-3 fw-bold shadow-sm" 
                          onClick={publishStream}
                          disabled={loading}
                        >
                          <i className="fas fa-play me-2"></i> Start Broadcasting
                        </button>
                      ) : (
                        <button 
                          className="btn btn-danger py-3 fw-bold shadow-sm" 
                          onClick={stopPublishing}
                          disabled={loading}
                        >
                          <i className="fas fa-stop me-2"></i> Stop Broadcasting
                        </button>
                      )}
                      
                      <button 
                        className="btn btn-outline-secondary py-3 fw-bold" 
                        onClick={leaveChannel}
                        disabled={loading}
                      >
                        <i className="fas fa-power-off me-2"></i> Turn Off Camera
                      </button>

                      {/* Mic & Video toggle row */}
                      <div className="d-flex gap-2">
                        <button 
                          className={`btn flex-fill py-3 fw-bold ${isMuted ? 'btn-danger' : 'btn-outline-dark'}`}
                          onClick={toggleMute}
                          disabled={loading}
                        >
                          <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} me-2`}></i>
                          {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                        </button>
                        <button 
                          className={`btn flex-fill py-3 fw-bold ${isVideoOff ? 'btn-danger' : 'btn-outline-dark'}`}
                          onClick={toggleVideo}
                          disabled={loading}
                        >
                          <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'} me-2`}></i>
                          {isVideoOff ? 'Video On' : 'Video Off'}
                        </button>
                      </div>

                      {/* Camera Flip on separate row */}
                      <button 
                        className="btn btn-outline-dark py-3 fw-bold"
                        onClick={switchCamera}
                        disabled={loading}
                      >
                        <i className="fas fa-camera-rotate me-2"></i> Flip Camera
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Admin Live Chat View */}
            <div className="card shadow-sm border-0 mt-4 d-flex flex-column" style={{ height: '300px' }}>
              <div className="card-header bg-white fw-bold py-3"><i className="fas fa-comments me-2 text-brand"></i> Live Comments</div>
              <div className="card-body bg-light overflow-auto d-flex flex-column gap-2" style={{ scrollbarWidth: 'none' }}>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`rounded px-3 py-2 small ${msg.senderName === 'Admin' ? 'bg-primary text-white align-self-end' : 'bg-white border align-self-start'}`} style={{ maxWidth: '85%' }}>
                      <div className="fw-bold" style={{ fontSize: '0.75rem', color: msg.senderName === 'Admin' ? '#e0e0e0' : '#ff7c04' }}>{msg.senderName} <span className="opacity-75 fw-normal ms-1">({msg.timestamp})</span></div>
                      <div className="text-break mt-1">{msg.message}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
              </div>
              <div className="card-footer bg-white p-2">
                 <form onSubmit={sendChatMessage} className="d-flex">
                   <input 
                     type="text" 
                     className="form-control form-control-sm border-0 bg-light shadow-none rounded-pill px-3" 
                     placeholder="Reply to viewers..." 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                   />
                   <button type="submit" className="btn btn-brand btn-sm rounded-circle ms-2 px-2 border-0" style={{ backgroundColor: '#ff7c04', color: 'white', width: '32px', height: '32px' }}>
                     <i className="fas fa-paper-plane"></i>
                   </button>
                 </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStudio;