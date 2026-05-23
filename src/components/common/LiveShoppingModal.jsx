import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axiosInstance from '../../utils/axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import authService from '../../services/authService';

const LiveShoppingModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(false);
  const [customerName, setCustomerName] = useState('Guest');
  
  // Chat & Viewer State
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const stompClientRef = useRef(null);

  const clientRef = useRef(null);
  const videoRef = useRef(null);
  const videoTrackRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch customer name when the live modal is opened (user is authenticated at this point)
  useEffect(() => {
    if (isOpen && customerName === 'Guest') {
      axiosInstance.get('/api/customer/profile')
        .then(res => {
          const data = res.data;
          const c = data.customer;
          if (c) {
            setCustomerName(c.firstName || c.lastName || c.user?.username || 'Viewer');
          }
        })
        .catch(() => {
          // Not a customer login — fallback to 'Viewer'
          setCustomerName('Viewer');
        });
    }
  }, [isOpen]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // STOMP Connection
  useEffect(() => {
    let isActive = true;
    if (isOpen) {
      // Use relative path to take advantage of React's proxy and avoid mixed content errors on HTTPS!
      const socket = new SockJS('/api/ws-live');
      const stompClient = Stomp.over(socket);
      
      // Disable debug logs in production
      stompClient.debug = () => {};

      stompClient.connect({}, () => {
        // Strict mode defense: if component already unmounted before connection finished, kill it.
        if (!isActive) {
           stompClient.send('/app/live.leave', {}, '');
           stompClient.disconnect();
           return;
        }

        stompClient.subscribe('/topic/live.chat', (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMsg]);
        });
        
        stompClient.subscribe('/topic/live.viewers', (msg) => {
          setViewerCount(parseInt(msg.body, 10));
        });

        // Register this customer as a viewer — this triggers accurate count
        stompClient.send('/app/live.join', {}, '');
      }, (err) => {
        console.error("STOMP Error:", err);
      });

      stompClientRef.current = stompClient;

      // Cleanup
      return () => {
        isActive = false;
        if (stompClient.connected) {
          stompClient.send('/app/live.leave', {}, '');
          stompClient.disconnect();
        }
      };
    } else {
      // Clear data when closing
      setMessages([]);
      setViewerCount(0);
    }
  }, [isOpen]);

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !stompClientRef.current?.connected) return;

    const chatMsg = {
      senderName: customerName,
      message: chatInput.trim(),
      type: 'CHAT'
    };

    stompClientRef.current.send("/app/live.chat.send", {}, JSON.stringify(chatMsg));
    setChatInput('');
  };

  // Poll backend or just wait for user click to check
  // For simplicity, we just let users join to see if it's live

  const joinLiveStream = async () => {
    // Check authentication first
    if (!authService.isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', location.pathname);
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      // 1. Fetch token and App ID from our secure backend
      const response = await axiosInstance.get('/video/token?channelName=anvi_studio_live&role=2'); // 2 = Subscriber
      const { appId, token, channel, uid } = response.data;

      // 2. Initialize Agora Client
      if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
        
        // Listen for when the admin publishes a video/audio track
        clientRef.current.on("user-published", async (user, mediaType) => {
          await clientRef.current.subscribe(user, mediaType);
          setIsLive(true);
          
          if (mediaType === "video") {
            videoTrackRef.current = user.videoTrack;
            if (videoRef.current) {
               user.videoTrack.play(videoRef.current);
            }
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        // Listen for when admin stops broadcasting
        clientRef.current.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
             setIsLive(false);
          }
        });
      }

      // 3. Set Role to Audience (Subscriber)
      await clientRef.current.setClientRole("audience");

      // 4. Join Channel
      await clientRef.current.join(appId, channel, token, uid);
      setJoined(true);
      setLoading(false);

      // 5. Catch any users that were already broadcasting before we joined
      clientRef.current.remoteUsers.forEach(async (user) => {
        if (user.hasVideo || user.hasAudio) {
          setIsLive(true);
          if (user.hasVideo) {
            await clientRef.current.subscribe(user, "video");
            if (videoRef.current) user.videoTrack.play(videoRef.current);
          }
          if (user.hasAudio) {
            await clientRef.current.subscribe(user, "audio");
            user.audioTrack.play();
          }
        }
      });

    } catch (err) {
      console.error("Failed to join live stream:", err);
      setError("Failed to connect to the live session.");
      setLoading(false);
    }
  };

  const leaveLiveStream = async () => {
    if (clientRef.current && joined) {
      await clientRef.current.leave();
      setJoined(false);
      setIsLive(false);
    }
    setIsOpen(false);
  };

  // Do not render the customer Live Shopping modal on Admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Floating Live Button */}
      <button 
        onClick={isOpen ? leaveLiveStream : joinLiveStream}
        className="live-shopping-float d-flex align-items-center justify-content-center shadow-lg"
        title="Live Shopping"
      >
        <div className="live-pulse-ring"></div>
        <i className="fas fa-video"></i>
        <span className="ms-2 fw-bold small text-uppercase tracking-wider">Live Show</span>
      </button>

      {/* Video Player Modal */}
      {isOpen && (
        <div className="live-video-overlay" style={{ zIndex: 1050 }}>
          <div className="live-video-container shadow-lg rounded-4 overflow-hidden bg-dark position-relative">
            {/* Header */}
            <div className="live-video-header p-3 d-flex justify-content-between align-items-center position-absolute top-0 w-100 z-3" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger pulse-badge rounded-pill px-3 py-2"><i className="fas fa-circle me-1 small"></i> LIVE</span>
                <span className="text-white fw-bold tracking-wider" style={{ fontFamily: 'Playfair Display' }}>Anvi Studio Exclusive</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                {isLive && (
                  <span className="text-white small fw-bold bg-dark bg-opacity-50 px-2 py-1 rounded-pill">
                    <i className="fas fa-eye me-1 text-brand"></i> {viewerCount}
                  </span>
                )}
                <button onClick={leaveLiveStream} className="btn text-white p-0 fs-4 hover-brand transition-colors"><i className="fas fa-times"></i></button>
              </div>
            </div>

            {/* Video Player Area */}
            <div className="live-video-player w-100 h-100 bg-black d-flex align-items-center justify-content-center" ref={videoRef} style={{ minHeight: '400px' }}>
               {loading && (
                 <div className="text-center text-white">
                   <div className="spinner-border text-brand mb-3" role="status"></div>
                   <p className="tracking-wider small text-uppercase">Connecting to studio...</p>
                 </div>
               )}
               
               {!loading && !isLive && joined && (
                 <div className="text-center text-white p-4">
                   <i className="fas fa-video-slash fs-1 mb-3 opacity-50"></i>
                   <h5 className="fw-bold" style={{ fontFamily: 'Playfair Display' }}>Studio Offline</h5>
                   <p className="text-white-50 small mb-0">The live broadcast hasn't started yet or has ended. Please check back later!</p>
                 </div>
               )}

               {error && (
                 <div className="text-center text-danger p-4">
                   <i className="fas fa-exclamation-circle fs-1 mb-3"></i>
                   <p className="small mb-0">{error}</p>
                 </div>
               )}
            </div>

            {/* Bottom Chat / Comment Area */}
            <div className="live-video-footer position-absolute bottom-0 w-100 z-3 d-flex flex-column" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', maxHeight: '50%' }}>
              
              {/* Messages Container */}
              <div className="flex-grow-1 overflow-auto px-3 pb-2 d-flex flex-column align-items-start" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                 <div className="mt-auto w-100 d-flex flex-column gap-2">
                     {isLive && (
                       <div className="bg-dark bg-opacity-75 rounded px-2 py-1 text-white small align-self-start" style={{ maxWidth: '85%' }}>
                          <i className="fas fa-info-circle me-1 text-brand"></i> Welcome to the live showcase!
                       </div>
                     )}
                     {messages.map((msg, idx) => (
                       <div key={idx} className="bg-dark bg-opacity-75 rounded px-2 py-1 text-white small align-self-start" style={{ maxWidth: '85%' }}>
                         <span className="fw-bold" style={{ color: '#ff7c04' }}>{msg.senderName}: </span>
                         <span className="text-break">{msg.message}</span>
                       </div>
                     ))}
                     <div ref={messagesEndRef} />
                 </div>
              </div>

              {/* Chat Input */}
              {isLive && (
                <div className="px-3 pb-3 pt-1">
                   <form onSubmit={sendChatMessage} className="d-flex align-items-center bg-white bg-opacity-25 rounded-pill p-1">
                     <input 
                       type="text" 
                       className="form-control bg-transparent border-0 text-white shadow-none placeholder-white" 
                       placeholder="Say something..." 
                       value={chatInput}
                       onChange={(e) => setChatInput(e.target.value)}
                       style={{ fontSize: '0.9rem' }}
                     />
                     <button type="submit" className="btn btn-brand rounded-circle px-3 py-2 ms-1 border-0" style={{ backgroundColor: '#ff7c04', color: 'white' }}>
                       <i className="fas fa-paper-plane"></i>
                     </button>
                   </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveShoppingModal;
