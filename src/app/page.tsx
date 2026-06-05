'use client';

import React, { useState, useEffect } from 'react';
import Carousel from '../components/Carousel';
import RankingRulesModal from '../components/RankingRulesModal';
import { Player, Event, Tip, EventPhoto } from './types';
import { dbService } from './lib/db';
import { authService } from './lib/auth';

// Mock initial data used to seed database on first load if empty
const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Nguyen Van An', points: 1450, department: 'Avionics Division', created_at: new Date().toISOString() },
  { id: '2', name: 'Tran Duc Binh', points: 1200, department: 'Engine Maintenance', created_at: new Date().toISOString() },
  { id: '3', name: 'Le Hoang Cuong', points: 1050, department: 'Quality Assurance', created_at: new Date().toISOString() },
  { id: '4', name: 'Pham Van Dung', points: 900, department: 'Avionics Division', created_at: new Date().toISOString() },
  { id: '5', name: 'Vu Minh Em', points: 850, department: 'Operations Control', created_at: new Date().toISOString() },
  { id: '6', name: 'Hoang Truong Giang', points: 700, department: 'Engine Maintenance', created_at: new Date().toISOString() },
  { id: '7', name: 'Ngo Thi Huong', points: 550, department: 'Logistics Office', created_at: new Date().toISOString() },
  { id: '8', name: 'Doan Quoc Khanh', points: 500, department: 'Quality Assurance', created_at: new Date().toISOString() }
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    name: 'VNA Tech Department Spring Championship',
    location: 'VNA Sports Complex, Hanoi',
    date: '2026-04-12',
    type: 'past',
    results: 'Champions: Nguyen Van An & Tran Duc Binh (+300 pts bonus). Runner-Ups: Le Hoang Cuong & Pham Van Dung (+200 pts bonus). Semi-Finalists: Vu Minh Em & Hoang Truong Giang (+150 pts bonus). Matches played: 12 total, high intensity rallies at the kitchen line!',
    photos: [
      { id: 'e1-p1', url: '/images/p1.jpg', caption: 'VNA Tech Department Spring Championship Opening Matches', isFeatured: true },
      { id: 'e1-p2', url: '/images/p2.jpg', caption: 'Nguyen Van An serving in the Finals', isFeatured: true }
    ]
  },
  {
    id: 'e2',
    name: 'Airbus A350 Team Friendly Cup',
    location: 'Gia Lam Club Court',
    date: '2026-05-18',
    type: 'past',
    results: 'Champions: Nguyen Van An & Le Hoang Cuong. Winner of 5 consecutive matches! Final Score: 11-8, 11-9.',
    photos: [
      { id: 'e2-p1', url: '/images/p3.jpg', caption: 'Warmups and Paddle Preparation', isFeatured: true },
      { id: 'e2-p2', url: '/images/p4.jpg', caption: 'Intense Tournament Doubles Play', isFeatured: true }
    ]
  },
  {
    id: 'e3',
    name: 'Technical Department Summer Tournament 2026',
    location: 'VNA Sports Complex, Hanoi',
    date: '2026-06-25',
    type: 'upcoming',
    photos: []
  },
  {
    id: 'e4',
    name: 'Boeing 787 Fleet Doubles Classic',
    location: 'My Dinh Court',
    date: '2026-08-14',
    type: 'upcoming',
    photos: []
  }
];

const INITIAL_TIPS: Tip[] = [
  {
    id: 't1',
    title: 'Master the Dinh (Dink) Shot',
    content: 'Keep your knees bent and push the ball softly over the net into the opponent\'s kitchen. Patience is key—wait for them to make a high ball mistake rather than forcing an attack.',
    category: 'Technique'
  },
  {
    id: 't2',
    title: 'Doubles Positioning & Sync',
    content: 'Move together with your partner like you are connected by a 10-foot rope. If they slide left to retrieve a wide shot, you must slide left to cover the middle gap.',
    category: 'Strategy'
  },
  {
    id: 't3',
    title: 'The Third Shot Drop',
    content: 'The most important shot in doubles. When returning from the baseline, hit a soft, looping arc that lands safely in the kitchen. This allows your team to run up to the net safely.',
    category: 'Tactics'
  },
  {
    id: 't4',
    title: 'Warm-up & Injury Prevention',
    content: 'Do 5-10 minutes of dynamic stretching targeting your shoulders, knees, and Achilles. Pickleball requires fast lateral movements which can stress cold joints.',
    category: 'Fitness'
  },
  {
    id: 't5',
    title: 'Serve & Return Depth',
    content: 'Keep serves and returns deep near the baseline. A deep return pins your opponents back, preventing an aggressive third shot and granting your team time to reach the kitchen line.',
    category: 'Tactics'
  },
  {
    id: 't6',
    title: 'The Transition Split-Step',
    content: 'Never run blindly through the transition zone while the ball is live. Split-step (freeze) into a balanced stance just before your opponent strikes the ball to reset hard returns.',
    category: 'Technique'
  },
  {
    id: 't7',
    title: 'Control the Seam',
    content: 'Hitting down the middle line ("the seam") reduces opponent angles, eliminates boundary line errors, and creates communication confusion between partner defenders.',
    category: 'Strategy'
  },
  {
    id: 't8',
    title: 'Target the Hip Pocket',
    content: 'When attacking, aim directly at your opponent\'s paddle-side hip or shoulder. This "jams" their arms, preventing them from extending their paddle and forcing weak pop-ups.',
    category: 'Tactics'
  }
];

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tips, setTips] = useState<Tip[]>(INITIAL_TIPS);

  // Connection mode check
  const [isLiveMode, setIsLiveMode] = useState(false);

  // UI States
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin View States
  const [adminActiveTab, setAdminActiveTab] = useState<'players' | 'events'>('players');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // New Player Form States
  const [pName, setPName] = useState('');
  const [pDept, setPDept] = useState('');
  const [pPoints, setPPoints] = useState(0);

  // New Event Form States
  const [eName, setEName] = useState('');
  const [eLoc, setELoc] = useState('');
  const [eDate, setEDate] = useState('');
  const [eType, setEType] = useState<'past' | 'upcoming'>('upcoming');
  const [eResults, setEResults] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Event Photo management states
  const [eventPhotos, setEventPhotos] = useState<EventPhoto[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoFeatured, setNewPhotoFeatured] = useState(true);

  // Pairings States
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [pairingStrategy, setPairingStrategy] = useState<'balanced' | 'competitive'>('balanced');
  const [suggestedPairs, setSuggestedPairs] = useState<{ p1: Player; p2: Player; combinedPoints: number }[]>([]);

  // Win tracker calculator setup
  const [eventPointsSetup, setEventPointsSetup] = useState<{
    playerId: string;
    wins: number;
    isChampion: boolean;
    isRunnerUp: boolean;
    isSemiFinalist: boolean;
    isQuarterFinalist: boolean;
  }[]>([]);

  // Function to load all data from services
  const loadDatabaseData = async () => {
    const fetchedPlayers = await dbService.getPlayers();
    const fetchedEvents = await dbService.getEvents();

    // Migrate legacy events on load (convert photos path string[] to EventPhoto[])
    const migratedEvents = fetchedEvents.map(e => {
      if (e.photos && Array.isArray(e.photos)) {
        const migratedPhotos = e.photos.map((p: any, pIdx) => {
          if (typeof p === 'string') {
            return {
              id: `${e.id}-photo-${pIdx}-${Date.now()}`,
              url: p,
              caption: e.name,
              isFeatured: true
            };
          }
          return p;
        });
        return { ...e, photos: migratedPhotos };
      }
      return e;
    });
    
    // Seed default mock data if database is empty (both live and local)
    if (fetchedPlayers.length === 0 && migratedEvents.length === 0) {
      for (const p of INITIAL_PLAYERS) {
        await dbService.savePlayer(p);
      }
      for (const e of INITIAL_EVENTS) {
        // Enforce EventPhoto migration format for seeded events
        const initialMigratedPhotos = e.photos?.map((p: any, pIdx) => {
          if (typeof p === 'string') {
            return {
              id: `${e.id}-photo-${pIdx}-${Date.now()}`,
              url: p,
              caption: e.name,
              isFeatured: true
            };
          }
          return p;
        });
        await dbService.saveEvent({ ...e, photos: initialMigratedPhotos });
      }
      const initialP = await dbService.getPlayers();
      const initialE = await dbService.getEvents();
      setPlayers(initialP);
      setEvents(initialE);
    } else {
      setPlayers(fetchedPlayers);
      setEvents(migratedEvents);
    }
  };

  useEffect(() => {
    // Determine integration mode
    setIsLiveMode(dbService.isLive() || authService.isLive());

    // Load initial DB info
    loadDatabaseData();

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribeToAuthChanges((session) => {
      setIsAdminMode(!!session);
    });

    return () => unsubscribe();
  }, []);

  // Initialize point calculator when player list or tab changes (only if not editing)
  useEffect(() => {
    if (!editingEvent) {
      setEventPointsSetup(players.map(p => ({
        playerId: p.id,
        wins: 0,
        isChampion: false,
        isRunnerUp: false,
        isSemiFinalist: false,
        isQuarterFinalist: false
      })));
    }
  }, [players, adminActiveTab, editingEvent]);

  // Auth Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await authService.signIn(username, password);
      setIsAdminMode(true);
      setIsLoginOpen(false);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed.');
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsAdminMode(false);
    setSuggestedPairs([]);
  };

  // Player CRUD
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pDept) return;

    if (editingPlayer) {
      // Update existing player
      const updatedPlayer: Player = {
        ...editingPlayer,
        name: pName,
        department: pDept,
        points: pPoints
      };
      await dbService.savePlayer(updatedPlayer);
      setEditingPlayer(null);
    } else {
      // Register new player
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: pName,
        points: pPoints,
        department: pDept,
        created_at: new Date().toISOString()
      };
      await dbService.savePlayer(newPlayer);
    }
    
    setPName('');
    setPDept('');
    setPPoints(0);
    await loadDatabaseData();
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setPName(player.name);
    setPDept(player.department);
    setPPoints(player.points);
  };

  const handleDeletePlayer = async (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      await dbService.deletePlayer(id);
      if (editingPlayer?.id === id) {
        setEditingPlayer(null);
        setPName('');
        setPDept('');
        setPPoints(0);
      }
      await loadDatabaseData();
    }
  };

  // Event Edit click handler
  const handleEditEventClick = (event: Event) => {
    setEditingEvent(event);
    setEName(event.name);
    setELoc(event.location);
    setEDate(event.date);
    setEType(event.type);
    setEResults(event.results || '');
    setEventPhotos(event.photos || []);

    // Restore points calculator setup from awardedDetails
    setEventPointsSetup(players.map(p => {
      const savedDetails = event.awardedDetails?.[p.id];
      return {
        playerId: p.id,
        wins: savedDetails?.wins || 0,
        isChampion: savedDetails?.isChampion || false,
        isRunnerUp: savedDetails?.isRunnerUp || false,
        isSemiFinalist: savedDetails?.isSemiFinalist || false,
        isQuarterFinalist: savedDetails?.isQuarterFinalist || false
      };
    }));
  };

  const handleCancelEditEvent = () => {
    setEditingEvent(null);
    setEName('');
    setELoc('');
    setEDate('');
    setEType('upcoming');
    setEResults('');
    setEventPhotos([]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoFeatured(true);
    setEventPointsSetup(players.map(p => ({
      playerId: p.id,
      wins: 0,
      isChampion: false,
      isRunnerUp: false,
      isSemiFinalist: false,
      isQuarterFinalist: false
    })));
  };

  // Event Delete handler with point reversal
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also revert any points awarded to players from this event.')) {
      return;
    }

    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    // Revert points if they were awarded
    if (eventToDelete.type === 'past' && eventToDelete.awardedPoints) {
      const currentPlayers = await dbService.getPlayers();
      
      for (const [playerId, pointsToRevert] of Object.entries(eventToDelete.awardedPoints)) {
        const player = currentPlayers.find(p => p.id === playerId);
        if (player) {
          await dbService.savePlayer({
            ...player,
            points: player.points - pointsToRevert
          });
        }
      }
    }

    // Delete the event
    await dbService.deleteEvent(eventId);

    if (editingEvent?.id === eventId) {
      handleCancelEditEvent();
    }

    await loadDatabaseData();
    alert('Event deleted and standings updated successfully!');
  };

  // Event Creation/Update with Standings Update (Cumulative points & Reversible logic)
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eName || !eLoc || !eDate) return;

    // Fetch latest player data to perform safe calculations
    const latestPlayers = await dbService.getPlayers();
    const playerPointsMap = new Map<string, number>();
    latestPlayers.forEach(p => playerPointsMap.set(p.id, p.points));

    // 1. Revert points of the event being edited (if it was completed)
    if (editingEvent && editingEvent.type === 'past' && editingEvent.awardedPoints) {
      for (const [playerId, pointsToRevert] of Object.entries(editingEvent.awardedPoints)) {
        const currentVal = playerPointsMap.get(playerId) || 0;
        playerPointsMap.set(playerId, currentVal - pointsToRevert);
      }
    }

    // 2. Calculate new points if type is past
    const newAwardedPoints: { [playerId: string]: number } = {};
    const newAwardedDetails: {
      [playerId: string]: {
        wins: number;
        isChampion: boolean;
        isRunnerUp: boolean;
        isSemiFinalist: boolean;
        isQuarterFinalist: boolean;
      }
    } = {};

    if (eType === 'past') {
      for (const p of latestPlayers) {
        const pSetup = eventPointsSetup.find(x => x.playerId === p.id);
        if (!pSetup) continue;

        let addedPoints = pSetup.wins * 100;
        if (pSetup.isChampion) addedPoints += 300;
        if (pSetup.isRunnerUp) addedPoints += 200; // updated placing rule: runner up 200 pts
        if (pSetup.isSemiFinalist) addedPoints += 150; // updated placing rule: semi 150 pts
        if (pSetup.isQuarterFinalist) addedPoints += 100;

        if (addedPoints > 0 || pSetup.wins > 0 || pSetup.isChampion || pSetup.isRunnerUp || pSetup.isSemiFinalist || pSetup.isQuarterFinalist) {
          newAwardedPoints[p.id] = addedPoints;
          newAwardedDetails[p.id] = {
            wins: pSetup.wins,
            isChampion: pSetup.isChampion,
            isRunnerUp: pSetup.isRunnerUp,
            isSemiFinalist: pSetup.isSemiFinalist,
            isQuarterFinalist: pSetup.isQuarterFinalist
          };

          const currentVal = playerPointsMap.get(p.id) || 0;
          playerPointsMap.set(p.id, currentVal + addedPoints);
        }
      }
    }

    // 3. Save updated player rankings to database
    for (const [playerId, newPoints] of playerPointsMap.entries()) {
      const origPlayer = latestPlayers.find(p => p.id === playerId);
      if (origPlayer && origPlayer.points !== newPoints) {
        await dbService.savePlayer({
          ...origPlayer,
          points: newPoints
        });
      }
    }

    // 4. Save Event (Create or Update)
    const eventId = editingEvent ? editingEvent.id : Date.now().toString();
    
    const eventToSave: Event = {
      id: eventId,
      name: eName,
      location: eLoc,
      date: eDate,
      type: eType,
      results: eType === 'past' ? eResults : undefined,
      photos: eventPhotos,
      awardedPoints: eType === 'past' ? newAwardedPoints : undefined,
      awardedDetails: eType === 'past' ? newAwardedDetails : undefined
    };

    await dbService.saveEvent(eventToSave);

    // Reset Form
    setEName('');
    setELoc('');
    setEDate('');
    setEType('upcoming');
    setEResults('');
    setEventPhotos([]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoFeatured(true);
    setEditingEvent(null);

    await loadDatabaseData();
    alert(editingEvent ? 'Event updated and standings recalculated successfully!' : 'Event created successfully!');
  };

  // Checkbox state change helpers
  const handlePointsCheckboxChange = (playerId: string, field: 'isChampion' | 'isRunnerUp' | 'isSemiFinalist' | 'isQuarterFinalist', val: boolean) => {
    setEventPointsSetup(prev => prev.map(item => 
      item.playerId === playerId ? { ...item, [field]: val } : item
    ));
  };

  const handleWinsChange = (playerId: string, val: number) => {
    setEventPointsSetup(prev => prev.map(item => 
      item.playerId === playerId ? { ...item, wins: val } : item
    ));
  };

  // Smart Pairing Suggester
  const handlePlayerSelectToggle = (id: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const generateSmartPairings = () => {
    const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));
    if (selectedPlayers.length < 2) {
      alert('Please select at least 2 players to generate pairings.');
      return;
    }

    // Sort selected players by points descending
    const sorted = [...selectedPlayers].sort((a, b) => b.points - a.points);
    const pairings: { p1: Player; p2: Player; combinedPoints: number }[] = [];

    if (pairingStrategy === 'balanced') {
      // Balanced: Pair highest with lowest, second-highest with second-lowest, etc.
      let left = 0;
      let right = sorted.length - 1;
      while (left < right) {
        pairings.push({
          p1: sorted[left],
          p2: sorted[right],
          combinedPoints: sorted[left].points + sorted[right].points
        });
        left++;
        right--;
      }
      if (left === right) {
        alert(`${sorted[left].name} is left without a partner due to an odd number of selected players.`);
      }
    } else {
      // Competitive: Pair adjacent players (similar rank)
      for (let i = 0; i < sorted.length - 1; i += 2) {
        pairings.push({
          p1: sorted[i],
          p2: sorted[i+1],
          combinedPoints: sorted[i].points + sorted[i+1].points
        });
      }
      if (sorted.length % 2 !== 0) {
        alert(`${sorted[sorted.length - 1].name} is left without a partner due to an odd number of selected players.`);
      }
    }

    setSuggestedPairs(pairings);
  };

  const sortedRankings = [...players].sort((a, b) => b.points - a.points);

  // Compute standard competition tie rankings (1224 style ranking)
  const rankingsWithRanks = sortedRankings.map((player, index) => {
    const rank = index === 0 || player.points === sortedRankings[index - 1].points
      ? (index === 0 ? 1 : -1)
      : index + 1;
    return { ...player, rank };
  });

  // Resolve ranks for players tied with preceding players
  for (let i = 1; i < rankingsWithRanks.length; i++) {
    if (rankingsWithRanks[i].rank === -1) {
      rankingsWithRanks[i].rank = rankingsWithRanks[i - 1].rank;
    }
  }

  // Extract all featured photos from events to show on the landing page carousel
  const carouselPhotos = events
    .flatMap(e => e.photos || [])
    .filter(p => p.isFeatured)
    .map(p => ({ url: p.url, caption: p.caption }));

  return (
    <div style={{ position: 'relative' }}>
      {/* Top Golden Wave Divider */}
      <div className="top-wave-container"></div>

      {/* Admin Toggle on Top Right Corner of Page */}
      <div style={{ position: 'absolute', top: '15px', right: '20px', zIndex: 100 }}>
        {isAdminMode ? (
          <button className="btn-red-outline" onClick={handleLogout} style={{ fontSize: '0.85rem', borderColor: 'var(--loss-red)', color: 'var(--loss-red)', backgroundColor: 'rgba(248, 113, 113, 0.1)' }}>
            🚪 Exit Admin Mode
          </button>
        ) : (
          <button className="btn-gold" onClick={() => setIsLoginOpen(true)} style={{ fontSize: '0.85rem' }}>
            🔑 Admin Access
          </button>
        )}
      </div>

      {/* Dynamic Environment Banner */}
      {!isLiveMode ? (
        <div className="demo-banner" style={{ zIndex: 90, position: 'relative' }}>
          ⚠️ Running in Demo Mode (Local Storage) <span className="badge-demo">Demo</span>
        </div>
      ) : (
        <div className="demo-banner" style={{ background: 'linear-gradient(90deg, #005b60, #00373a)', zIndex: 90, position: 'relative' }}>
          ✅ Connected to Database Services <span className="badge-live">Live</span>
        </div>
      )}

      <div className="app-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Brand Header */}
        <header className="brand-header">
          <div className="brand-header-flex">
            {/* Larger Yellow Pickleball Paddle SVG */}
            <svg viewBox="0 0 100 100" fill="currentColor" className="brand-paddle">
              {/* Paddle Head */}
              <rect x="25" y="15" width="50" height="50" rx="16" />
              {/* Handle */}
              <rect x="45" y="62" width="10" height="25" rx="3" />
              {/* Small handle grip tape detail */}
              <rect x="43" y="82" width="14" height="5" rx="1" fill="#0b5768" />
              {/* Small pickleball ball outline next to paddle */}
              <circle cx="80" cy="55" r="8" />
              <circle cx="80" cy="55" r="1.5" fill="#0b5768" />
              <circle cx="75" cy="50" r="1.5" fill="#0b5768" />
              <circle cx="85" cy="60" r="1.5" fill="#0b5768" />
              <circle cx="75" cy="60" r="1.5" fill="#0b5768" />
              <circle cx="85" cy="50" r="1.5" fill="#0b5768" />
            </svg>
            
            {/* Brand Title Group */}
            <div className="brand-title-group brand-title-text-align">
              <h1 className="brand-title" style={{ fontSize: '2.4rem' }}>Vietnam Airlines</h1>
              <div className="brand-subtitle" style={{ fontSize: '1rem', letterSpacing: '0.2em', marginTop: '0.2rem' }}>Technical Department Pickleball Club</div>
              <div className="brand-slogan" style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '0.6rem', opacity: 0.9 }}>KHỎE ĐỂ VƯƠN MÌNH</div>
            </div>
          </div>
        </header>

        {!isAdminMode ? (
          /* ==========================================
             PUBLIC LANDING PAGE VIEW
             ========================================== */
          <div className="main-layout fade-in">
            {/* Left Column: Carousel & Upcoming/Past events */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Image Carousel (Center Left) */}
              <section className="premium-card" style={{ padding: '0.75rem' }}>
                <Carousel photos={carouselPhotos} />
              </section>

              {/* Upcoming Tournaments */}
              <section className="premium-card">
                <div style={{ borderBottom: '1px solid rgba(197, 160, 89, 0.15)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <h2>Upcoming Tournaments</h2>
                </div>
                <div className="events-section">
                  {events.filter(e => e.type === 'upcoming').length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No upcoming events scheduled yet.</p>
                  ) : (
                    events.filter(e => e.type === 'upcoming').map(e => (
                      <div key={e.id} className="event-card">
                        <div className="event-details">
                          <div className="event-meta">
                            <span>📅 {e.date}</span>
                            <span>📍 {e.location}</span>
                          </div>
                          <h3 className="event-title">{e.name}</h3>
                        </div>
                        <span className="event-badge badge-upcoming">Upcoming</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Past Tournaments */}
              <section className="premium-card">
                <div style={{ borderBottom: '1px solid rgba(197, 160, 89, 0.15)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <h2>🏆 Tournament Archive & Results</h2>
                </div>
                <div className="events-section">
                  {events.filter(e => e.type === 'past').length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No past events archived yet.</p>
                  ) : (
                    events.filter(e => e.type === 'past').map(e => (
                      <div key={e.id} className="event-card">
                        <div className="event-details">
                          <div className="event-meta">
                            <span>📅 {e.date}</span>
                            <span>📍 {e.location}</span>
                          </div>
                          <h3 className="event-title">{e.name}</h3>
                          {e.results && (
                            <div className="event-results">
                              <strong>Match Summary:</strong>
                              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>{e.results}</p>
                            </div>
                          )}
                        </div>
                        <span className="event-badge badge-past">Completed</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Pickleball Tips */}
              <section className="premium-card">
                <div style={{ borderBottom: '1px solid rgba(197, 160, 89, 0.15)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <h2>💡 Pro Pickleball Tips</h2>
                </div>
                <div className="tips-grid">
                  {tips.map(t => (
                    <div key={t.id} className="tip-card">
                      <div className="tip-header">
                        <span className="tip-category">{t.category}</span>
                      </div>
                      <h4 className="tip-title">{t.title}</h4>
                      <p className="tip-content">{t.content}</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Right Column: Player Rankings */}
            <div className="rankings-sidebar">
              <div className="premium-card" style={{ height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(197, 160, 89, 0.15)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.4rem' }}>📊 Player Standings</h2>
                  <button className="ranking-link" onClick={() => setIsRulesOpen(true)}>
                    Ranking Rules
                  </button>
                </div>

                <div className="standings-table-container">
                  <table className="standings-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', color: 'var(--vn-gold)' }}>Rank</th>
                        <th style={{ color: 'var(--vn-gold)' }}>Player</th>
                        <th style={{ color: 'var(--vn-gold)' }}>Department</th>
                        <th style={{ textAlign: 'right', color: 'var(--vn-gold)' }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingsWithRanks.map((p, idx) => {
                        const rankClass = p.rank <= 3 ? 'rank-best-3rd' : 'rank-other';
                        return (
                          <tr key={p.id}>
                            <td>
                              <span className={`rank-badge ${rankClass}`}>
                                {p.rank}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600, color: '#ffffff' }}>{p.name}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.department}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--vn-gold-dark)' }}>{p.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================
             ADMIN DASHBOARD VIEW
             ========================================== */
          <div className="fade-in">
            <div className="premium-card" style={{ marginBottom: '2rem' }}>
              <div className="admin-header-row">
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>⚙️ Admin Dashboard</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Add/Edit players, log matches with automatic ranking point distribution, and suggest doubles pairings.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`btn-gold ${adminActiveTab === 'players' ? '' : 'btn-teal-outline'}`}
                    onClick={() => setAdminActiveTab('players')}
                    style={{ background: adminActiveTab === 'players' ? undefined : 'transparent' }}
                  >
                    👤 Player Manager
                  </button>
                  <button
                    className={`btn-gold ${adminActiveTab === 'events' ? '' : 'btn-teal-outline'}`}
                    onClick={() => setAdminActiveTab('events')}
                    style={{ background: adminActiveTab === 'events' ? undefined : 'transparent' }}
                  >
                    📅 Event Creator & Standings
                  </button>
                </div>
              </div>

              {adminActiveTab === 'players' ? (
                /* Player CRUD & Pairings Generation Grid */
                <div className="admin-panel-grid">
                  
                  {/* Left Column: Player List & Editor */}
                  <div>
                    <h3 className="section-title">{editingPlayer ? '📝 Edit Player Info' : '➕ Register New Player'}</h3>
                    <form onSubmit={handleAddPlayer} className="admin-login-form" style={{ marginBottom: '2.5rem', backgroundColor: 'var(--bg-cream)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Player Full Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pName}
                            onChange={(e) => setPName(e.target.value)}
                            placeholder="e.g. Nguyen Van An"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Department / Team</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pDept}
                            onChange={(e) => setPDept(e.target.value)}
                            placeholder="e.g. Avionics Division"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Base Ranking Points</label>
                          <input
                            type="number"
                            className="form-input"
                            value={pPoints}
                            onChange={(e) => setPPoints(Number(e.target.value))}
                            placeholder="e.g. 500"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn-gold">
                          {editingPlayer ? 'Update Player' : 'Add Player Profile'}
                        </button>
                        {editingPlayer && (
                          <button
                            type="button"
                            className="btn-teal-outline"
                            onClick={() => {
                              setEditingPlayer(null);
                              setPName('');
                              setPDept('');
                              setPPoints(0);
                            }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>

                    <h3 className="section-title">Club Roster ({players.length} players)</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {players.map(p => (
                        <div key={p.id} className="admin-list-row">
                          <div>
                            <span className="admin-list-name">{p.name}</span>
                            <div className="admin-list-meta">
                              <span>🏢 {p.department}</span>
                              <span style={{ marginLeft: '1rem', fontWeight: 600, color: 'var(--vn-gold-dark)' }}>🏆 {p.points} pts</span>
                            </div>
                          </div>
                          <div className="admin-list-actions">
                            <button className="btn-teal-outline" onClick={() => handleEditClick(p)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}>
                              ✏️ Edit
                            </button>
                            <button className="btn-red-outline" onClick={() => handleDeletePlayer(p.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}>
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Doubles Pairing Suggester */}
                  <div style={{ borderLeft: '1px solid rgba(197, 160, 89, 0.15)', paddingLeft: '1.5rem' }}>
                    <h3 className="section-title">🤝 Smart Doubles Pairings Suggester</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Select the players arriving for play and let the software suggest doubles teams.
                    </p>

                    <div style={{ backgroundColor: 'var(--bg-cream)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Pairing Strategy</label>
                        <select
                          className="form-input"
                          value={pairingStrategy}
                          onChange={(e) => setPairingStrategy(e.target.value as 'balanced' | 'competitive')}
                        >
                          <option value="balanced">Balanced Doubles (Highest + Lowest rank)</option>
                          <option value="competitive">Competitive Tiers (Adjacent rank pairs)</option>
                        </select>
                      </div>

                      <button className="btn-gold" onClick={generateSmartPairings} style={{ width: '100%' }}>
                        🎲 Suggest Pairings
                      </button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Select Attending Players ({selectedPlayerIds.length} chosen):</strong>
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--vn-teal)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          onClick={() => {
                            if (selectedPlayerIds.length === players.length) setSelectedPlayerIds([]);
                            else setSelectedPlayerIds(players.map(p => p.id));
                          }}
                        >
                          {selectedPlayerIds.length === players.length ? 'Clear All' : 'Select All'}
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', backgroundColor: 'var(--vn-teal-dark)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        {players.map(p => (
                          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.2rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedPlayerIds.includes(p.id)}
                              onChange={() => handlePlayerSelectToggle(p.id)}
                            />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--vn-gold)', fontWeight: 600 }}>{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {suggestedPairs.length > 0 && (
                      <div className="fade-in" style={{ backgroundColor: 'rgba(0, 91, 96, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--vn-teal)' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--vn-gold)', marginBottom: '0.75rem' }}>🎯 Suggested Pairings:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {suggestedPairs.map((pair, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--vn-teal-dark)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                              <span>
                                👥 <strong>Team {idx + 1}:</strong> <span style={{ color: 'var(--vn-gold)', fontWeight: 600 }}>{pair.p1.name}</span> & <span style={{ color: 'var(--vn-gold)', fontWeight: 600 }}>{pair.p2.name}</span>
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Comb: {pair.combinedPoints} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Event Creator & Point Calculator */
                <div>
                  <h3 className="section-title">🏆 Create Tournament Event & Apply Point Calculation</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Enter event details. For completed past tournaments, tick the win amounts and placing bonuses to automatically calculate points and update player standings cumulatively.
                  </p>

                  <form onSubmit={handleCreateEvent} className="admin-login-form">
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Event Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={eName}
                          onChange={(e) => setEName(e.target.value)}
                          placeholder="e.g. Airbus A350 Tournament"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-input"
                          value={eLoc}
                          onChange={(e) => setELoc(e.target.value)}
                          placeholder="e.g. VNA Sports Complex"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={eDate}
                          onChange={(e) => setEDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Event Type</label>
                        <select
                          className="form-input"
                          value={eType}
                          onChange={(e) => setEType(e.target.value as 'past' | 'upcoming')}
                        >
                          <option value="upcoming">Upcoming Event (Public Notice)</option>
                          <option value="past">Completed Past Event (Log Results & Points)</option>
                        </select>
                      </div>
                    </div>

                    {/* Manage Event Photos Section */}
                    <div style={{ backgroundColor: 'var(--vn-teal-dark)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
                      <h4 className="section-title" style={{ color: 'var(--vn-gold)', borderBottomColor: 'rgba(235, 184, 25, 0.15)', marginBottom: '0.75rem' }}>📸 Manage Event Photos</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Attach photos to this event and select which ones are featured in the Landing Page auto-rotating Carousel.
                      </p>

                      {/* Add Photo controls */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(197, 160, 89, 0.15)', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--vn-gold)' }}>➕ Add Photo to Event</span>
                        
                        {/* Preset Photo Grid Picker */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Quick Pick from Preset Photos:</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                            {Array.from({ length: 9 }).map((_, idx) => {
                              const imgUrl = `/images/p${idx + 1}.jpg`;
                              const isSelected = newPhotoUrl === imgUrl;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setNewPhotoUrl(imgUrl)}
                                  style={{
                                    height: '50px',
                                    backgroundImage: `url(${imgUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: isSelected ? '2px solid var(--vn-gold)' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: isSelected ? 1 : 0.6,
                                    transition: 'all 0.2s'
                                  }}
                                  title={`Preset Image ${idx + 1}`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', padding: 0 }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Photo Path or URL</label>
                            <input
                              type="text"
                              className="form-input"
                              value={newPhotoUrl}
                              onChange={(e) => setNewPhotoUrl(e.target.value)}
                              placeholder="e.g. /images/p1.jpg or external https://..."
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Photo Caption</label>
                            <input
                              type="text"
                              className="form-input"
                              value={newPhotoCaption}
                              onChange={(e) => setNewPhotoCaption(e.target.value)}
                              placeholder="e.g. Final podium celebration"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ffffff', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={newPhotoFeatured}
                              onChange={(e) => setNewPhotoFeatured(e.target.checked)}
                            />
                            🌟 Show in Landing Page Carousel
                          </label>
                          <button
                            type="button"
                            className="btn-gold"
                            onClick={() => {
                              if (!newPhotoUrl) {
                                alert('Please select a preset photo or enter a photo URL.');
                                return;
                              }
                              const newPhotoItem: EventPhoto = {
                                id: Math.random().toString(),
                                url: newPhotoUrl,
                                caption: newPhotoCaption || eName || 'Event Photo',
                                isFeatured: newPhotoFeatured
                              };
                              setEventPhotos(prev => [...prev, newPhotoItem]);
                              setNewPhotoUrl('');
                              setNewPhotoCaption('');
                              setNewPhotoFeatured(true);
                            }}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                          >
                            Add Photo
                          </button>
                        </div>
                      </div>

                      {/* Photo List */}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', display: 'block', marginBottom: '0.5rem' }}>Currently Attached Photos ({eventPhotos.length}):</span>
                      {eventPhotos.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>No photos attached to this event yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', padding: '0.25rem' }}>
                          {eventPhotos.map((photo) => (
                            <div key={photo.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(197, 160, 89, 0.15)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                              <div
                                style={{
                                  height: '75px',
                                  backgroundImage: `url(${photo.url})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  position: 'relative'
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setEventPhotos(prev => prev.filter(x => x.id !== photo.id))}
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'rgba(239, 68, 68, 0.85)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    lineHeight: 1
                                  }}
                                  title="Remove photo"
                                >
                                  ×
                                </button>
                              </div>
                              <div style={{ padding: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 500, color: '#ffffff' }} title={photo.caption}>{photo.caption}</span>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                  <input
                                    type="checkbox"
                                    checked={photo.isFeatured}
                                    onChange={(e) => {
                                      const updated = eventPhotos.map(item =>
                                        item.id === photo.id ? { ...item, isFeatured: e.target.checked } : item
                                      );
                                      setEventPhotos(updated);
                                    }}
                                  />
                                  🌟 Carousel
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {eType === 'past' && (
                      <div className="fade-in" style={{ backgroundColor: 'var(--bg-cream)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
                        <h4 className="section-title" style={{ color: 'var(--vn-teal-dark)', borderBottomColor: 'rgba(0, 91, 96, 0.15)' }}>📋 Standings Point Calculator (Cumulative Rule)</h4>
                        
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                          <label className="form-label">Writeup / Summary of Results</label>
                          <textarea
                            className="form-input"
                            value={eResults}
                            onChange={(e) => setEResults(e.target.value)}
                            placeholder="Champions: An & Binh. Match scores, high points, notes..."
                            rows={3}
                            required={eType === 'past'}
                          />
                        </div>

                        <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Set Cumulative Achievements:</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', backgroundColor: 'var(--vn-teal-dark)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          {eventPointsSetup.map((item) => {
                            const player = players.find(p => p.id === item.playerId);
                            if (!player) return null;

                            return (
                              <div key={item.playerId} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(235, 184, 25, 0.15)', fontSize: '0.85rem' }}>
                                <span style={{ fontWeight: 600, width: '150px', color: 'var(--vn-gold)' }}>{player.name}</span>
                                
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                    Wins:
                                    <input
                                      type="number"
                                      min={0}
                                      value={item.wins}
                                      onChange={(e) => handleWinsChange(item.playerId, Number(e.target.value))}
                                      style={{ width: '45px', padding: '0.1rem 0.25rem', borderRadius: '4px', border: '1.5px solid var(--border-color)' }}
                                    />
                                  </label>

                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#b45309' }}>
                                    <input
                                      type="checkbox"
                                      checked={item.isChampion}
                                      onChange={(e) => handlePointsCheckboxChange(item.playerId, 'isChampion', e.target.checked)}
                                    />
                                    🥇 Champ (+300)
                                  </label>

                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#6b21a8' }}>
                                    <input
                                      type="checkbox"
                                      checked={item.isRunnerUp}
                                      onChange={(e) => handlePointsCheckboxChange(item.playerId, 'isRunnerUp', e.target.checked)}
                                    />
                                    🥈 Runner-up (+200)
                                  </label>

                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#0369a1' }}>
                                    <input
                                      type="checkbox"
                                      checked={item.isSemiFinalist}
                                      onChange={(e) => handlePointsCheckboxChange(item.playerId, 'isSemiFinalist', e.target.checked)}
                                    />
                                    🥉 Semi (+150)
                                  </label>

                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#475569' }}>
                                    <input
                                      type="checkbox"
                                      checked={item.isQuarterFinalist}
                                      onChange={(e) => handlePointsCheckboxChange(item.playerId, 'isQuarterFinalist', e.target.checked)}
                                    />
                                    🏅 Quarter (+100)
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <button type="submit" className="btn-gold">
                        {editingEvent ? '💾 Update Event Entry' : '💾 Create Event Entry'}
                      </button>
                      {editingEvent && (
                        <button type="button" className="btn-teal-outline" onClick={handleCancelEditEvent}>
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(197, 160, 89, 0.15)', margin: '2.5rem 0' }} />

                  <h3 className="section-title">📅 Club Events Manager</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    View, modify, or delete club tournament events. Modifying or deleting completed events automatically recalculates standings.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {events.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No events stored in the database.</p>
                    ) : (
                      events.map(e => (
                        <div key={e.id} className="admin-list-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--vn-teal-dark)' }}>
                          <div>
                            <span className="admin-list-name" style={{ color: 'var(--vn-gold)', fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>{e.name}</span>
                            <div className="admin-list-meta" style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>📅 {e.date}</span>
                              <span>📍 {e.location}</span>
                              <span className={`event-badge ${e.type === 'past' ? 'badge-past' : 'badge-upcoming'}`}>
                                {e.type === 'past' ? 'Completed' : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                          <div className="admin-list-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-teal-outline" onClick={() => handleEditEventClick(e)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                              ✏️ Edit
                            </button>
                            <button className="btn-red-outline" onClick={() => handleDeleteEvent(e.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: '4rem', borderTop: '1px solid rgba(197, 160, 89, 0.15)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            © 2026 Vietnam Airlines Joint Stock Company. Technical Department Pickleball Club.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--vn-teal)', fontWeight: 600 }}>Golden Lotus Pride</span>
          </div>
        </footer>

        {/* Ranking Rules Modal */}
        <RankingRulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

        {/* Admin Login Modal */}
        {isLoginOpen && (
          <div className="modal-overlay fade-in" onClick={() => setIsLoginOpen(false)}>
            <div className="modal-container" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <svg className="modal-lotus" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 85C50 85 36 62 36 45C36 30 50 15 50 15C50 15 64 30 64 45C64 62 50 85 50 85Z" fill="currentColor"/>
                </svg>
                <h2 className="modal-title">Admin Authentication</h2>
                <button className="modal-close-btn" onClick={() => setIsLoginOpen(false)}>×</button>
              </div>
              <form onSubmit={handleLoginSubmit}>
                <div className="modal-body admin-login-form">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Enter credentials to gain access to write operations (CRUD, Event Logging, Standings computation).
                  </p>

                  {loginError && (
                    <div className="error-message">
                      {loginError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. admin123"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-teal-outline" onClick={() => setIsLoginOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-gold">
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
