"use client";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
// --- BRAND THEME ---
const theme = {
  navy: "#073763",
  navyHover: "#052a4e",
  blue: "#1a6bcc",
  blueHover: "#1558aa",
  lightBlue: "#e8f0fb",
  text: "#1a2332",
  textMuted: "#4a5568",
  border: "#e2e8f0",
  bg: "#ffffff",
  bgOff: "#f9f9f9",
  shadow: "0 4px 16px rgba(0,0,0,0.08)",
  shadowHover: "0 8px 24px rgba(0,0,0,0.12)",
  radius: "12px",
  radiusSm: "6px"
};
export default function Home() {
  // --- STYLES ---
  // --- STYLES ---
  const sidebarStyle: React.CSSProperties = { 
    position: "absolute", top: "20px", left: "20px", width: "360px", padding: "24px", 
    backgroundColor: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)",
    borderRadius: theme.radius, boxShadow: theme.shadow, border: `1px solid ${theme.border}`,
    display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 85px)", overflowY: "auto", zIndex: 10 
  };
  const rowStyle: React.CSSProperties = { display: "flex", gap: "8px" };
  const numInputStyle: React.CSSProperties = { 
    flex: 1, minWidth: 0, padding: "10px", 
    border: "1px solid #cbd5e1", // Crisper darker border
    borderRadius: theme.radiusSm, 
    fontSize: "16px", 
    backgroundColor: "#ffffff", // Pure white to contrast with the sidebar
    color: theme.text, 
    WebkitTextFillColor: theme.text, 
    opacity: 1,
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" // Adds depth
  };
  
  const inputStyle: React.CSSProperties = { 
      padding: "10px", 
      border: "1px solid #cbd5e1", // Crisper darker border
      borderRadius: theme.radiusSm, width: "100%", 
      fontSize: "16px", 
      backgroundColor: "#ffffff", // Pure white
      color: theme.text, 
      WebkitTextFillColor: theme.text, 
      opacity: 1,
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" // Adds depth
  };
  const labelStyle: React.CSSProperties = { 
      fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", 
      color: theme.navy, marginTop: "8px", marginBottom: "6px", display: "block" 
  };
  
  const createBtnStyle: React.CSSProperties = { 
      marginTop: "20px", padding: "14px", backgroundColor: theme.blue, color: "white", 
      border: "none", borderRadius: theme.radiusSm, cursor: "pointer", fontWeight: 600, fontSize: "14px",
      boxShadow: "0 2px 8px rgba(26,107,204,0.3)", transition: "all 0.2s ease" 
  };
  const activeTabBtn: React.CSSProperties = { flex: 1, padding: "10px", backgroundColor: "#0b1b3d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
  const inactiveTabBtn: React.CSSProperties = { flex: 1, padding: "10px", backgroundColor: "#ddd", color: "#555", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
  const [registerEmail, setRegisterEmail] = useState(""); // --- NEW ---
  const [user, setUser] = useState<{ id: number, username: string, email?: string, is_premium: boolean, max_airports: number, ion_token: string } | null>(null);
  // --- NEW: AESTHETIC NOTIFICATION SYSTEM ---
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success' | 'info'} | null>(null);
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
    if (type === 'success') {
      setTimeout(() => setToast(null), 5000);
    }
  };
  // The UI was designed for ~1200 px wide desktops. On narrower screens we
  // scale the whole inner canvas down so all panels stay visible at once,
  // exactly like "Request Desktop Site" in a mobile browser.
  const DESIGN_W = 1200;
  const [vpScale, setVpScale] = useState(1);
  const [scaledH, setScaledH] = useState("100vh");
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < DESIGN_W) {
        const s = vw / DESIGN_W;
        setVpScale(s);
        // Make the inner div tall enough that, after scaling, it fills the real viewport height
        setScaledH(`${vh / s}px`);
      } else {
        setVpScale(1);
        setScaledH("100vh");
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  // YOUR Global Default Token (The one currently in useEffect)
  const DEFAULT_ION_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';
  const [editIonToken, setEditIonToken] = useState(""); // --- NEW ---
  // --- APV Baro-VNAV State ---
  const [apvBaroParams, setApvBaroParams] = useState({
    acftCategory: "A",
    vpaDeg: 3.0,
    rdh: 15.0,
    maGradientPct: 2.5,
    heightFap: 1000.0,
    deltaH: 50.0,
    aerodromeElevFt: 100.0,
    fafDist: 10000, // Distance from threshold to FAF in meters
    maptDist: 1000  // Distance from threshold to MAPt in meters
  });
  // --- QUICK TOOLS STATE ---
  const [showTools, setShowTools] = useState(true); // Toggle the widget visibility
  const [activeTool, setActiveTool] = useState<"none" | "ruler" | "point">("none");
  const [toolTip, setToolTip] = useState(""); // Instructions (e.g. "Click Start Point")
  const [arcCode, setArcCode] = useState<string>("Auto"); // "Auto", "1", "2", "3", or "4"
  // --- Missing RNAV State ---
  const [rnavParams, setRnavParams] = useState({
    mode: "Advanced RNP",
    alt_unit: "m",
    use_if: true,
    use_faf: true,
    use_mapt: true,
    use_ma_end: true,
    if_lat: 0, if_lon: 0,
    faf_lat: 0, faf_lon: 0, faf_alt: 0,
    mapt_lat: 0, mapt_lon: 0, mapt_alt: 0,
    ma_end_lat: 0, ma_end_lon: 0,
    acft_cat: "C"
  });
  // --- OAS (Obstacle Assessment Surface) State - ICAO Standard ---
  const [oasParams, setOasParams] = useState({
    // Navigation Aid Data
    appCat: "ILS CAT I",
    glidePath: 3.0,
    rdh: 15.0,
    locThrDist: 3000,
    courseWidth: 210,

    // Aircraft Data
    missedAppCG: 2.5,
    acCategory: "C",
    isStandard: true,
    wingSemiSpan: 30,
    antennaHeight: 6.0
  });
  // --- Wind Spiral State ---
  const [wsParams, setWsParams] = useState({
    ias: 205,
    altitude_ft: 800,
    bank_angle: 15,
    wind_speed: 30,
    ad_elev_ft: 0,
    temp_ref_c: 15,
    turn_direction: "R",
    inbound_bearing: 90
  });
  // --- Holding / Reversal State ---
  const [holdingParams, setHoldingParams] = useState({
    type: "HOLDING", // "HOLDING", "RACETRACK", "BASE_TURN", "PROC_TURN_45"
    ias: 200,
    alt_ft: 5000,
    time_min: 1.0,
    inbound_brg: 90,
    turn_dir: "R",
    ad_elev_ft: 0,
    temp_ref_c: 15
  });
  // Data for the tools
  const [rulerPts, setRulerPts] = useState<Cesium.Cartesian3[]>([]);
  const [measureResult, setMeasureResult] = useState<{ m: number, nm: number } | null>(null);
  const [pointResult, setPointResult] = useState<{ lat: number, lon: number, alt: number } | null>(null);
  // Dashboard Management State
  const [manageAptSelect, setManageAptSelect] = useState("");
  const [manageAptName, setManageAptName] = useState("");
  const [manageAptPublic, setManageAptPublic] = useState(true);

  // Ref to store tool entities so we can clean them up easily
  const toolsDataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  // ... inside Home() ...
  const [showGoogleTiles, setShowGoogleTiles] = useState(false); // Checkbox state
  const googleTilesRef = useRef<any>(null); // Memory reference to the tileset
  const [currentOwnerToken, setCurrentOwnerToken] = useState<string | null>(null); // Track if we are using a custom token
  // ... existing states ...
  const [isResending, setIsResending] = useState(false); // UI toggle for Resend View
  const [resendEmailInput, setResendEmailInput] = useState(""); // Input for Resend
  // Loading States for Buttons
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // --- Profile Settings State ---
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(true); // Default to open so they see they need to login
  const [expandedSurfaceId, setExpandedSurfaceId] = useState<string | null>(null);

  // --- Forgot Password State ---
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [mounted, setMounted] = useState(false);
  // --- NEW: UI & Redraw States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const drawnSurfacesRef = useRef<any[]>([]);
  // --- Map Display States ---
  const [isGenericMode, setIsGenericMode] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false); // --- NEW ---
  const buildingsRef = useRef<any>(null); // --- NEW ---
  // UI State: "define" or "analyze"
  const [activeTab, setActiveTab] = useState("define");
  const genericColor = Cesium.Color.SLATEGRAY.withAlpha(0.5); // Choose your generic color here
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  // Map Controls State
  const [exaggeration, setExaggeration] = useState(1);
    const exagRef = useRef(1); // <-- ADD THIS
  const getTrueMslAltitude = async (cartesian: Cesium.Cartesian3): Promise<{lat: number, lon: number, alt: number}> => {
    if (!viewerRef.current) return { lat: 0, lon: 0, alt: 0 };
    const viewer = viewerRef.current;

    // 1. Get the raw coordinates of the exact 3D pixel you clicked
    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    const lat = parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(6));
    const lon = parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(6));

    // 2. Read the CURRENT exaggeration directly from the scene (No Refs needed!)
    const currentExag = viewer.scene.verticalExaggeration || 1.0;

    // 3. Un-scale the clicked height. 
    // If you clicked a point 301m in the air, and exag is 7, this forces it back to 43m.
    const unexaggeratedEllipsoidHeight = carto.height / currentExag;

    // 4. Fetch the EGM96 Geoid Offset to convert Ellipsoid to MSL
    let offset = 0;
    try {
        const res = await fetch(`${API_BASE}/geoid-offset?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data.offset !== undefined) offset = data.offset;
    } catch (e) {
        console.warn("Geoid fetch failed", e);
    }

    // 5. Calculate final MSL (43m Ellipsoid - 38m Offset = 5m MSL)
    let trueMslAlt = parseFloat((unexaggeratedEllipsoidHeight - offset).toFixed(2));
    
    // Fallback to 0 if sea depth is weirdly negative
    if (trueMslAlt < -500) trueMslAlt = 0;

    return { lat, lon, alt: trueMslAlt };
  };
  const [geoidOffset, setGeoidOffset] = useState(0);
  // --- RNAV Map Cursor Selector ---
  const [selectingRnavPoint, setSelectingRnavPoint] = useState<"IF" | "FAF" | "MAPT" | "MA_END" | null>(null);

  useEffect(() => {
    // Only turn on the map listener if the user clicked a target button
    if (!viewerRef.current || !selectingRnavPoint) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);

    handler.setInputAction((click: any) => {
      const cartesian = viewerRef.current?.camera.pickEllipsoid(click.position);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
        const lon = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));

        // Update the correct RNAV coordinate
        setRnavParams(prev => {
          if (selectingRnavPoint === "IF") return { ...prev, if_lat: lat, if_lon: lon };
          if (selectingRnavPoint === "FAF") return { ...prev, faf_lat: lat, faf_lon: lon };
          if (selectingRnavPoint === "MAPT") return { ...prev, mapt_lat: lat, mapt_lon: lon };
          if (selectingRnavPoint === "MA_END") return { ...prev, ma_end_lat: lat, ma_end_lon: lon };
          return prev;
        });

        // Turn off the target cursor automatically after a successful click!
        setSelectingRnavPoint(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [selectingRnavPoint]);
  // --- HELPER: Pick Coordinates from Map ---
  const getCenterFromMap = (setter: React.Dispatch<React.SetStateAction<any>>, currentVal: any) => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    viewer.canvas.style.cursor = "crosshair";

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(async (click: any) => {
      // 1. Use the highly accurate Raycaster (Same as the Point Tool)
      const ray = viewer.camera.getPickRay(click.position);
      if (!ray) return;
      
      let cartesian: Cesium.Cartesian3 | undefined = viewer.scene.globe.pick(ray, viewer.scene);

      // 2. Fallback to 3D Tile picking ONLY if we clicked a building
      if (!cartesian) {
        cartesian = viewer.scene.pickPosition(click.position);
      }

      if (cartesian) {
        viewer.canvas.style.cursor = "wait"; 
        
        // 3. Extract unified MSL Altitude
        const { lat, lon, alt } = await getTrueMslAltitude(cartesian);
        setter({ ...currentVal, lat, lon, alt });

        viewer.canvas.style.cursor = "default";
        handler.destroy();
      } else {
        viewer.canvas.style.cursor = "default";
        handler.destroy();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };

  // --- HELPER: Auto-fetch Geoid Offset ---
  const autoFetchGeoidOffset = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`${API_BASE}/geoid-offset?lat=${lat}&lon=${lon}&t=${Date.now()}`);
      const data = await res.json();
      if (data.offset !== undefined) {
        setGeoidOffset(data.offset);
        return data.offset;
      }
    } catch (err) {
      console.error("Failed to fetch geoid offset", err);
    }
    return 0;
  };
  // Public Surface Search State
  const [pubSurfQuery, setPubSurfQuery] = useState("");
  const [pubSurfResults, setPubSurfResults] = useState<any[]>([]);
  const [airportName, setAirportName] = useState("");
  // Open Source Data Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<any[]>([]);
  // RNAV State
  const [rnavMode, setRnavMode] = useState("RNP APCH");
  const [altUnit, setAltUnit] = useState("ft"); // "m" or "ft"
  const [useCustomRnav, setUseCustomRnav] = useState(false);

  // Custom Overrides (NM by default for XTT/ATT, Meters for SW?)
  // Let's assume standard units: NM for XTT/ATT, NM or M for SW? 
  // PANS-OPS tables usually give km or NM. Let's use NM to be safe and consistent.
  const [rnavOverrides, setRnavOverrides] = useState({
    if_xtt: 1.0, if_att: 0.8, if_sw: 2.5,
    faf_xtt: 0.3, faf_att: 0.24, faf_sw: 1.45,
    mapt_xtt: 0.3, mapt_att: 0.24, mapt_sw: 0.95,
    mapt_soc: "" // Distance in NM from MAPt to SOC
  });

  // --- Heliport Specific State ---
  const [heliPreset, setHeliPreset] = useState("cat_a");

  const [heliParams, setHeliParams] = useState({
    fatoType: "non_instrument",
    lat: 40.4168, lon: -3.7038, alt: 100,
    bearing: 45,
    innerWidth: 30,
    startOffset: 15,
    // Bug F fix: PinS VSS gate for visual FATO transitional surfaces (Annex 14 Vol II §4.1.9)
    hasPinsVss: false,
    // Approach Sections (Length, Slope%, Div%, MaxOuterWidth m — null = uncapped)
    // Bug G fix: max_outer_width enforces ICAO Table 4-1 footnote (b) 7D/10D cap
    appS1Len: 3386, appS1Slope: 4.5, appS1Div: 10.0, appS1MaxW: null as number | null,
    appS2Len: 0, appS2Slope: 0, appS2Div: 0.0, appS2MaxW: null as number | null,
    appS3Len: 0, appS3Slope: 0, appS3Div: 0.0, appS3MaxW: null as number | null,
    // Take-off Sections
    tkofS1Len: 3386, tkofS1Slope: 4.5, tkofS1Div: 10.0, tkofS1MaxW: null as number | null,
    tkofS2Len: 0, tkofS2Slope: 0, tkofS2Div: 0.0, tkofS2MaxW: null as number | null,
    tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0.0, tkofS3MaxW: null as number | null,
  });

  const handleHeliPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value;
    setHeliPreset(preset);
    // Reset Bug F/G fields on every preset change
    const base = { hasPinsVss: false, appS1MaxW: null, appS2MaxW: null, appS3MaxW: null, tkofS1MaxW: null, tkofS2MaxW: null, tkofS3MaxW: null };
    if (preset === "cat_a") { // PC1 — Slope Cat A
      setHeliParams(prev => ({
        ...prev, ...base, fatoType: "non_instrument", innerWidth: 30, startOffset: 15,
        appS1Len: 3386, appS1Slope: 4.5, appS1Div: 10, appS2Len: 0, appS2Slope: 0, appS2Div: 0, appS3Len: 0, appS3Slope: 0, appS3Div: 0,
        tkofS1Len: 3386, tkofS1Slope: 4.5, tkofS1Div: 10, tkofS2Len: 0, tkofS2Slope: 0, tkofS2Div: 0, tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0
      }));
    } else if (preset === "cat_b") { // PC3 — Bug C fix: S2 divergence = 10% (same as S1, ICAO Table 4-1 "1st and 2nd section")
      setHeliParams(prev => ({
        ...prev, ...base, fatoType: "non_instrument", innerWidth: 30, startOffset: 15,
        appS1Len: 245, appS1Slope: 8.0, appS1Div: 10, appS2Len: 830, appS2Slope: 16.0, appS2Div: 10, appS3Len: 0, appS3Slope: 0, appS3Div: 0,
        tkofS1Len: 245, tkofS1Slope: 8.0, tkofS1Div: 10, tkofS2Len: 830, tkofS2Slope: 16.0, tkofS2Div: 10, tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0
      }));
    } else if (preset === "cat_c") { // PC2 — Slope Cat C
      setHeliParams(prev => ({
        ...prev, ...base, fatoType: "non_instrument", innerWidth: 30, startOffset: 15,
        appS1Len: 1220, appS1Slope: 12.5, appS1Div: 10, appS2Len: 0, appS2Slope: 0, appS2Div: 0, appS3Len: 0, appS3Slope: 0, appS3Div: 0,
        tkofS1Len: 1220, tkofS1Slope: 12.5, tkofS1Div: 10, tkofS2Len: 0, tkofS2Slope: 0, tkofS2Div: 0, tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0
      }));
    } else if (preset === "non_precision") { // Instrument Non-Precision
      setHeliParams(prev => ({
        ...prev, ...base, fatoType: "non_precision", innerWidth: 90, startOffset: 60,
        appS1Len: 2500, appS1Slope: 3.33, appS1Div: 16, appS2Len: 0, appS2Slope: 0, appS2Div: 0, appS3Len: 0, appS3Slope: 0, appS3Div: 0,
        tkofS1Len: 2850, tkofS1Slope: 3.5, tkofS1Div: 30, tkofS2Len: 1510, tkofS2Slope: 3.5, tkofS2Div: 0, tkofS3Len: 7640, tkofS3Slope: 2.0, tkofS3Div: 0
      }));
    } else if (preset === "precision") {
      // Bug D fix: S2=2500 m (not 5500), add horizontal S3=4500 m — Annex 14 Vol II Table A2-2 (3° approach)
      setHeliParams(prev => ({
        ...prev, ...base, fatoType: "precision", innerWidth: 90, startOffset: 60,
        appS1Len: 3000, appS1Slope: 2.5, appS1Div: 25, appS2Len: 2500, appS2Slope: 3.0, appS2Div: 15, appS3Len: 4500, appS3Slope: 0, appS3Div: 0,
        tkofS1Len: 2850, tkofS1Slope: 3.5, tkofS1Div: 30, tkofS2Len: 1510, tkofS2Slope: 3.5, tkofS2Div: 0, tkofS3Len: 7640, tkofS3Slope: 2.0, tkofS3Div: 0
      }));
    }
  };

  // ── APV BARO state (Doc 8168 Part III §3.4) ───────────────────────────────
  const [apvParams, setApvParams] = useState({
    thrLat: 10.4309, thrLon: -75.5134, thrAlt: 2.0,
    bearing: 194.0,        // final approach track TO threshold
    vpaDeg: 3.0,           // promulgated VPA (°)
    rdh: 15.0,             // reference datum height (m)
    aeroElftFt: 0.0,       // aerodrome elevation (ft) — for Hi tier selection
    fafLat: 10.3498, fafLon: -75.5174, fafAlt: 500.0,
    maptLat: 10.4309, maptLon: -75.5134,
    maGradPct: 2.5,        // missed approach gradient (%)
    acftCat: "C",          // "AB", "C", "D"
    heightFap: 1000.0,  // <-- ADD THIS
    deltaH: 50.0,       // <-- ADD THIS
  });

  const clearTools = () => {
    setActiveTool("none");
    setRulerPts([]);
    setMeasureResult(null);
    setPointResult(null);
    setToolTip("");
    if (toolsDataSourceRef.current) {
      toolsDataSourceRef.current.entities.removeAll();
    }
  };

  // NAVAID specific state
  const [navType, setNavType] = useState("CVOR");
  const [navCoord, setNavCoord] = useState({ lat: 51.47, lon: -0.45, alt: 25 });
  const [navBearing, setNavBearing] = useState(90);
  const [navThr, setNavThr] = useState({ lat: 51.47, lon: -0.42, alt: 25 });
  const isDirectional = ["ILS_LLZ_SF", "ILS_LLZ_DF", "ILS_GP", "MLS_AZ", "MLS_EL", "DME_DIR"].includes(navType);

  // Define State
  const [surfName, setSurfName] = useState("");
  const [family, setFamily] = useState("OLS"); // OLS, OAS, VSS, etc.
  const [t1, setT1] = useState({ lat: 10.430861, lon: -75.513378, alt: 2.13 });
  const [t2, setT2] = useState({ lat: 10.452475, lon: -75.512492, alt: 2.13 });
  const [arpAlt, setArpAlt] = useState(1.22);
  const [runwayType, setRunwayType] = useState("precision");
  // --- Custom OLS State ---
  const [cOls, setCOls] = useState({
    draw_strip: true, strip_end: 60, strip_width: 75,
    draw_app: true, app_div: 15, app_s1_len: 3000, app_s1_slope: 2, app_s2_len: 3600, app_s2_slope: 2.5, app_s3_len: 8400, app_s3_slope: 0,
    draw_dep: true, dep_inner: 180, dep_start: 60, dep_div: 12.5, dep_slope: 2, dep_len: 15000, dep_max_w: 1200,
    draw_trans: true, trans_slope: 14.3,
    draw_ihs: true, ihs_radius: 4000,
    draw_conical: true, conical_slope: 5, conical_height: 100,
    draw_balked: false, balked_start: 1800, balked_slope: 3.33, balked_div: 10,
    draw_in_app: false, in_app_len: 900, in_app_hw: 60, in_app_slope: 2, in_app_offset: 60,
    draw_in_trans: false
  });

  // --- VSS / OCS State ---
  const [vssParams, setVssParams] = useState({
    vpa: 3.0,
    rdh: 15.0,            // <-- NEW RDH PARAMETER
    appType: "NPA",
    stripWidth: 150,      // VSS Half-Width
    ocsStartWidth: 30,    // OCS Start Half-Width 
    ocsEndWidthBase: 120, // OCS End Base Width 
    oca: 100,
    vssAngle: 1.88,
    ocsAngle: 2.00,
    offsetAngle: 0.0,
    drawVSS: true,
    drawOCS: true
  });

  // Helper to auto-calculate slopes when VPA or Type changes
  const handleVpaOrTypeChange = (newVpa: number, newType: string) => {
    const newVss = newVpa - 1.12;
    let newOcs = 0;
    if (newType === "NPA") newOcs = newVpa - 1.0;
    else if (newType === "APV_BARO") newOcs = newVpa - 0.5;
    else if (newType === "APV_GEO") newOcs = newVpa - 0.5;

    setVssParams(prev => ({
      ...prev,
      vpa: newVpa,
      appType: newType,
      vssAngle: Number(newVss.toFixed(2)),
      ocsAngle: Number(newOcs.toFixed(2))
    }));
  };
  // OFZ specific state
  const [adg, setAdg] = useState("IV");
  const handleDeleteComponent = async (surfaceId: string, componentName: string) => {
    if (!confirm(`Delete only the "${componentName}" layer?`)) return;

    try {
      // Use query parameter for the component name to handle spaces/special chars safely
      const res = await fetch(`${API_BASE}/surface/${surfaceId}/component?component_name=${encodeURIComponent(componentName)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const data = await res.json();
        return showToast(data.detail || "Failed to delete component", "error");
      }

      // Update Local State without reloading
      setSavedSurfaces(prev => prev.map(s => {
        if (s.id === surfaceId) {
          // Remove the specific geometry from the local cached object
          return {
            ...s,
            geometry: s.geometry.filter((g: any) => g.name !== componentName)
          };
        }
        return s;
      }));

    } catch (err) {
      showToast("Network error deleting component.", "error");
    }
  };

  // Analyze State
  const [savedSurfaces, setSavedSurfaces] = useState<any[]>([]);
  const [selectedAnalysisAirport, setSelectedAnalysisAirport] = useState("");
  const [selectedAnalysisOwner, setSelectedAnalysisOwner] = useState<number>(0);
  const [obsPos, setObsPos] = useState({ lat: 51.475, lon: -0.44, alt: 50 });
  const [customPoints, setCustomPoints] = useState(""); // Stores "lat,lon,alt" string
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("aero_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleAuth = async () => {
    if (!loginInput || !passwordInput) return showToast("Enter username and password", "error");

    // --- THE LOCK: Prevent double-clicks! ---
    if (isLoggingIn) return;
    setIsLoggingIn(true); // Lock the button

    if (isRegistering) {
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: loginInput,
            password: passwordInput,
            email: registerEmail,
            is_premium: false
          })
        });

        const data = await res.json();
        if (!res.ok) {
          showToast(`Registration Error: ${data.detail || "Server failed"}`, "error");
        } else {
          setIsRegistering(false);
          showToast("Registration successful! Please log in.", "success");
        }
      } catch (err) {
        showToast("Network error: Could not reach the server.", "error");
      } finally {
        setIsLoggingIn(false); // Unlock the button
      }
    } else {
      const formData = new URLSearchParams();
      formData.append("username", loginInput);
      formData.append("password", passwordInput);

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData
        });
        const data = await res.json();

        if (data.detail || !data.access_token) {
          setIsLoggingIn(false); // Unlock if bad password
          return showToast(`Login Error: ${data.detail || "Invalid credentials"}`, "error");
        }

        localStorage.setItem("aero_token", data.access_token);

        const res2 = await fetch(`${API_BASE}/users/me`, {
          headers: { "Authorization": `Bearer ${data.access_token}` }
        });
        const userData = await res2.json();

        setUser(userData);
        setLoginInput("");
        setPasswordInput("");

        // Unlock and close the panel instantly!
        setIsLoggingIn(false);
        setShowAccountPanel(false);

        // Fetch heavy 3D data quietly in the background
        fetch(`${API_BASE}/get-surfaces`, {
          headers: { "Authorization": `Bearer ${data.access_token}` }
        })
          .then(surfRes => surfRes.json())
          .then(surfs => setSavedSurfaces(surfs))
          .catch(err => console.error("Background fetch failed:", err));

      } catch (err) {
        showToast("Network error: Could not reach the server.", "error");
        setIsLoggingIn(false); // Unlock if server crashes
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aero_token");
    setUser(null);
    setSavedSurfaces([]);
    viewerRef.current?.entities.removeAll();
  };

  const handleUpdateProfile = async () => {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        username: editUsername || null,
        email: editEmail || null,
        password: editPassword || null,
        ion_token: editIonToken || null
      })
    });

    const data = await res.json();
    if (!res.ok) return showToast(`Update Error: ${data.detail}`, "error");

    // Save the brand new token so they don't get logged out
    localStorage.setItem("aero_token", data.access_token);
    showToast("Profile updated successfully!", "success");
    const res2 = await fetch(`${API_BASE}/users/me`, {
      headers: { "Authorization": `Bearer ${data.access_token}` }
    });
    const userData = await res2.json();
    setUser(userData);
    setLoginInput("");
    setPasswordInput("");
    setShowAccountPanel(false);
    // Fetch surfaces without reloading
    const surfRes = await fetch(`${API_BASE}/get-surfaces`, {
      headers: { "Authorization": `Bearer ${data.access_token}` }
    });
    const surfs = await surfRes.json();
    setSavedSurfaces(surfs);
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      (window as any).CESIUM_BASE_URL = '/cesium/';
    }
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';
  }, []);

  // Dynamic X-Ray Mode
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.scene.globe.depthTestAgainstTerrain = !isXRayMode;
    }
  }, [isXRayMode]);

  // Check if user clicked a Password Reset or Verification link
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const rToken = params.get("reset_token");
      if (rToken) setResetToken(rToken);

      const vToken = params.get("verify_token");
      if (vToken) {
        fetch(`${API_BASE}/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: vToken })
        }).then(res => res.json()).then(data => {
          showToast(data.message || data.detail, "info");
          window.location.href = "/"; // Strip the token from the URL
        });
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("aero_token");
    if (token) {
      fetch(`${API_BASE}/users/me`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUser(data);
            setEditUsername(data.username || "");
            setEditEmail(data.email || "");
            setEditIonToken(data.ion_token || "");
            // Fetch Surfaces
            fetch(`${API_BASE}/get-surfaces`, { headers: { "Authorization": `Bearer ${token}` } })
              .then(r => r.json()).then(surfs => setSavedSurfaces(surfs));

          }
        });
    }
  }, []);

  useEffect(() => {
    if (mounted && cesiumContainer.current && !viewerRef.current) {
      viewerRef.current = new Cesium.Viewer(cesiumContainer.current, {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        baseLayerPicker: false,
        animation: false,
        timeline: false,
      });

      viewerRef.current.scene.globe.depthTestAgainstTerrain = true;
    }

    return () => {
      // Cleanup to prevent memory leaks when navigating or unmounting
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [mounted]);

  // --- NEW: Toggle Google Photorealistic 3D Tiles ---
  // --- NEW: Toggle Google Photorealistic 3D Tiles ---
  useEffect(() => {
    const toggleGoogleTiles = async () => {
      if (!viewerRef.current) return;

      if (showGoogleTiles) {
        try {
          // 1. Remove standard OSM buildings if they overlap
          if (buildingsRef.current) {
            viewerRef.current.scene.primitives.remove(buildingsRef.current);
            buildingsRef.current = null;
            setShowBuildings(false);
          }

          // 2. Load Google 3D Tiles
          const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
          viewerRef.current.scene.primitives.add(tileset);
          googleTilesRef.current = tileset;

          // --- FIX: USE THE NEW ".terrain" PROPERTY ---
          // Setting this to undefined makes it a smooth Ellipsoid (WGS84)
          // so it doesn't poke through the Google 3D mesh.
          (viewerRef.current.scene as any).terrain = undefined;

        } catch (err) {
          showToast("Could not load Google 3D Tiles.", "error");
          setShowGoogleTiles(false);
        }
      } else {
        // Remove the Google tileset
        if (googleTilesRef.current) {
          viewerRef.current.scene.primitives.remove(googleTilesRef.current);
          googleTilesRef.current = null;
        }

        // --- FIX: RESTORE WORLD TERRAIN USING ".terrain" ---
        (viewerRef.current.scene as any).terrain = Cesium.Terrain.fromWorldTerrain();
      }
    };

    toggleGoogleTiles();
  }, [showGoogleTiles]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const entities = viewerRef.current.entities.values;
    entities.forEach((entity) => {
      if (entity.polygon) {
        if (isGenericMode) {
          entity.polygon.material = new Cesium.ColorMaterialProperty(genericColor);
        } else {
        }
      }
    });
  }, [isGenericMode]);

  // --- NEW: Toggle 3D Buildings ---
  useEffect(() => {
    const toggleBuildings = async () => {
      if (!viewerRef.current) return;

      // If checked and we haven't downloaded them yet
      if (showBuildings && !buildingsRef.current) {
        try {
          const buildings = await Cesium.createOsmBuildingsAsync();
          if (viewerRef.current) {
            viewerRef.current.scene.primitives.add(buildings);
            buildingsRef.current = buildings; // Save to memory!
          }
        } catch (err) {
          console.error("Could not load 3D buildings", err);
        }
      }
      // If they are already in memory, just flip the visibility switch instantly
      else if (buildingsRef.current) {
        buildingsRef.current.show = showBuildings;
      }
    };

    toggleBuildings();
  }, [showBuildings]);

  // Map Click Listener for Analyze Tab
  useEffect(() => {
    if (!viewerRef.current || !mounted) return;
    const viewer = viewerRef.current;
    let handler: Cesium.ScreenSpaceEventHandler | null = null;

    if (activeTab === "analyze") {
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction(async (click: any) => {
        // 1. Use the highly accurate Raycaster (Same as the Point Tool)
        const ray = viewer.camera.getPickRay(click.position);
        if (!ray) return;

        let cartesian: Cesium.Cartesian3 | undefined = viewer.scene.globe.pick(ray, viewer.scene);
        
        // 2. Fallback to 3D Tile picking ONLY if we clicked a building
        if (!cartesian) {
            cartesian = viewer.scene.pickPosition(click.position);
        }

        if (cartesian) {
          viewer.canvas.style.cursor = "wait";

          // Extract unified MSL Altitude
          const { lat, lon, alt } = await getTrueMslAltitude(cartesian);

          // Update the input boxes
          setObsPos(prev => ({ 
            ...prev, 
            lat: parseFloat(lat.toFixed(6)), 
            lon: parseFloat(lon.toFixed(6)),
            alt: alt > -500 ? alt : 50 // Fallback to 50 only if weird negative sea depth
          }));

          // Draw visual marker
          viewer.entities.removeById('obs-marker');
          viewer.entities.add({
            id: 'obs-marker',
            position: cartesian,
            point: { pixelSize: 12, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 }
          });
          
          viewer.canvas.style.cursor = "default";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    return () => {
      if (handler) handler.destroy();
    };
  }, [activeTab, mounted]);

  // Handle CSV File Upload for Premium Users
  // Handle KML/DXF File Upload for Premium Users
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt") || name.endsWith(".csv")) {
      // Legacy local read for CSV/TXT
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCustomPoints(text);
      };
      reader.readAsText(file);
      return;
    }

    // New Server-Side Import for KML/DXF
    if (
      name.endsWith(".kml") ||
      name.endsWith(".dxf") ||
      name.endsWith(".geojson") ||
      name.endsWith(".json") ||
      name.endsWith(".aixm") ||
      name.endsWith(".xml")
    ) {
      const formData = new FormData();
      formData.append("file", file);

      setIsCreating(true); // Reuse loading state
      try {
        const res = await fetch(`${API_BASE}/import/geometry`, {
          method: "POST",
          headers: {
            // Do NOT set Content-Type header manually for FormData, 
            // browser does it automatically with boundary!
            "Authorization": getAuthHeaders()["Authorization"] || ""
          },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Import failed");

        setCustomPoints(data.result); // Populate the text area!
        showToast("File imported! Please review coordinates in the text box before creating.", "info");

      } catch (err: any) {
        showToast(`Import Error: ${err.message}`, "error");
      } finally {
        setIsCreating(false);
      }
    }
  };

  // --- BATCH FILE UPLOAD HELPER ---
  const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();

    // For standard CSV/TXT, parse locally in the browser
    if (name.endsWith(".txt") || name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBatchInput(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      // For complex files (GeoJSON/AIXM/KML), send to the backend parser
      const formData = new FormData();
      formData.append("file", file);

      setIsAnalyzingBatch(true); // Show loading state
      try {
        const res = await fetch(`${API_BASE}/import/geometry`, {
          method: "POST",
          headers: { "Authorization": getAuthHeaders()["Authorization"] || "" },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Import failed");

        // Filter out Polygons! Obstacles must be exactly 4 parts: "ID, Lat, Lon, Alt"
        const parsedLines = data.result.split('\n');
        const obstacleLines = parsedLines.filter((line: string) => {
          return line.trim().split(',').length === 4;
        });

        if (obstacleLines.length === 0 && parsedLines.length > 0) {
          showToast("File processed, but no standalone Points/Obstacles were found. Polygons cannot be used as obstacles.", "info");
        } else {
          setBatchInput(obstacleLines.join('\n'));
        }
      } catch (err: any) {
        showToast(`Batch Import Error: ${err.message}`, "error");
      } finally {
        setIsAnalyzingBatch(false);
      }
    }
  };

  // --- BATCH ANALYSIS LOGIC ---
  const handleBatchAnalyze = async () => {
    if (!selectedAnalysisAirport) return showToast("Please select a target airport first!", "error");

    // Parse the input text
    const lines = batchInput.split("\n");
    const obsList = lines.map(line => {
      const parts = line.split(",").map(s => s.trim());
      if (parts.length === 4) {
        return { id: parts[0], lat: parseFloat(parts[1]), lon: parseFloat(parts[2]), alt: parseFloat(parts[3]) };
      }
      return null;
    }).filter(o => o !== null);

    if (obsList.length === 0) return showToast("No valid obstacles found. Use ID, Lat, Lon, Alt format.", "error");

    setIsAnalyzingBatch(true); // --- START LOADING ---
    try {
      const res = await fetch(`${API_BASE}/analyze-batch`, {
        method: "POST",
        headers: getAuthHeaders(),
        // THE FIX: Send the keys that match our new Pydantic Model!
        body: JSON.stringify({
          airport_name: selectedAnalysisAirport,
          owner_id: selectedAnalysisOwner,
          obstacles: obsList
        }),
      });

      const data = await res.json();
      if (data.error) return showToast(data.error, "error");

      setBatchResults(data.results);

      // --- DRAW RESULTS ON MAP ---
      if (viewerRef.current) {
        const entitiesToRemove: Cesium.Entity[] = [];
        viewerRef.current.entities.values.forEach(e => {
          if (e.id && e.id.toString().startsWith('batch-obs-')) entitiesToRemove.push(e);
        });
        entitiesToRemove.forEach(e => viewerRef.current?.entities.remove(e));

        data.results.forEach((res: any) => {
          const isPenetrating = res.penetration;
          const color = isPenetrating ? Cesium.Color.RED : Cesium.Color.LIGHTSKYBLUE;

          viewerRef.current?.entities.add({
            id: `batch-obs-${res.id}`,
            position: Cesium.Cartesian3.fromDegrees(res.lon, res.lat, res.alt),
            point: { pixelSize: 12, color: color, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
            label: {
              text: `${res.id}\n${isPenetrating ? '❌' : '✅'}`,
              font: "10pt sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -10)
            },
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights([res.lon, res.lat, 0, res.lon, res.lat, res.alt]),
              width: 2,
              material: color.withAlpha(0.6)
            }
          });
        });
      }
    } catch (err) {
      showToast("Network error processing batch.", "error");
    } finally {
      setIsAnalyzingBatch(false); // --- STOP LOADING ---
    }
  };

  const downloadBatchCSV = () => {
    if (!batchResults.length) return;
    const headers = ["ID", "Lat", "Lon", "Alt", "Limiting Surface", "Max Allowed (m)", "Margin (m)", "Violation"];
    const rows = batchResults.map(r => [
      r.id, r.lat, r.lon, r.alt,
      r.limiting_surface,
      r.allowed_alt ?? "N/A",
      r.margin ?? "N/A",
      r.penetration ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Obstacle_Analysis_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateBatchPDF = () => {
    if (!batchResults || batchResults.length === 0) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // --- 1. REPORT HEADER ---
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102); // Navy Blue
    doc.text("BATCH OBSTACLE EVALUATION REPORT", 105, 20, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    // Calculate Summary Stats
    const totalCount = batchResults.length;
    const penetrationsCount = batchResults.filter(r => r.penetration).length;

    // --- 2. METADATA SECTION ---
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date of Analysis: ${date}`, 14, 35);
    doc.text(`Evaluated Airspace: ${selectedAnalysisAirport}`, 14, 42);
    doc.text(`Total Obstacles Evaluated: ${totalCount}`, 14, 49);

    if (penetrationsCount > 0) {
      doc.setTextColor(200, 0, 0); // Red
      doc.text(`Total Violations Detected: ${penetrationsCount}`, 14, 56);
    } else {
      doc.setTextColor(0, 150, 0); // Green
      doc.text(`Total Violations Detected: 0 (All Clear)`, 14, 56);
    }

    // --- 3. AUTO-TABLE (Handles multi-page breaks automatically!) ---
    autoTable(doc, {
      startY: 65,
      headStyles: { fillColor: [0, 51, 102], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      head: [['ID', 'Lat', 'Lon', 'Prop. Height', 'Limiting Surface', 'Max Allowed', 'Margin', 'Violation']],
      body: batchResults.map((r: any) => [
        r.id,
        parseFloat(r.lat).toFixed(5),
        parseFloat(r.lon).toFixed(5),
        `${parseFloat(r.alt).toFixed(2)} m`,
        r.limiting_surface || "None",
        r.allowed_alt !== null ? `${parseFloat(r.allowed_alt).toFixed(2)} m` : "N/A",
        r.margin !== null ? `${parseFloat(r.margin).toFixed(2)} m` : "N/A",
        r.penetration ? "YES" : "NO"
      ]),
      // Color-code the "YES" / "NO" column
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 7) {
          if (data.cell.raw === "YES") {
            data.cell.styles.textColor = [200, 0, 0];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [0, 150, 0];
          }
        }
      }
    });

    // --- 4. FOOTER DISCLAIMER ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount} - Automated analysis report. Verify with local Civil Aviation Authorities.`, 105, pageHeight - 10, { align: "center" });
    }

    // --- 5. TRIGGER DOWNLOAD ---
    doc.save(`AeroCheck_Batch_Report_${selectedAnalysisAirport.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  // --- DATABASE SEARCH LOGIC ---
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    let url = `${API_BASE}/search/airports?q=${query}`;
    if (family === "NAVAID") url = `${API_BASE}/search/navaids?q=${query}`;
    if (family === "HELIPORT") url = `${API_BASE}/search/airports?q=${query}&is_heliport=true`; // THE FIX

    const res = await fetch(url);
    const data = await res.json();
    setSearchResults(data);
    setIsSearching(false);
  };

  const handleSelectRunway = async (airport: any, runway?: any) => {
    // OurAirports uses feet. We MUST convert to meters (1 ft = 0.3048 m)
    const ftToM = 0.3048;
    const arpAltM = (Number(airport.alt_ft) || 0) * ftToM;
    const finalArpAlt = Number(arpAltM.toFixed(2));

    setArpAlt(finalArpAlt);

    let centerLat: number;
    let centerLon: number;

    // CASE 1: A specific runway is selected (Standard Aeroplane OLS/OFZ)
    if (runway) {
      setSurfName(`${airport.ident} - RWY ${runway.le_ident}/${runway.he_ident}`);

      centerLat = Number(runway.le_latitude_deg);
      centerLon = Number(runway.le_longitude_deg);

      setT1({
        lat: centerLat,
        lon: centerLon,
        alt: Number(((Number(runway.le_elevation_ft) || Number(airport.alt_ft) || 0) * ftToM).toFixed(2))
      });

      setT2({
        lat: Number(runway.he_latitude_deg),
        lon: Number(runway.he_longitude_deg),
        alt: Number(((Number(runway.he_elevation_ft) || Number(airport.alt_ft) || 0) * ftToM).toFixed(2))
      });
    }
    // CASE 2: No runway exists (Heliports / NAVAIDs using base facility coordinates)
    else {
      setSurfName(`${airport.ident} - Base Facility`);

      centerLat = Number(airport.lat) || 0;
      centerLon = Number(airport.lon) || 0;

      setT1({ lat: centerLat, lon: centerLon, alt: finalArpAlt });
      setT2({ lat: centerLat, lon: centerLon, alt: finalArpAlt });
    }

    // --- THE FIX: Sync coordinates to Heliport & NAVAID parameters using proper state names ---
    setHeliParams(prev => ({ ...prev, lat: centerLat, lon: centerLon, alt: finalArpAlt }));
    setNavCoord(prev => ({ ...prev, lat: centerLat, lon: centerLon, alt: finalArpAlt }));
    setNavThr(prev => ({ ...prev, lat: centerLat, lon: centerLon, alt: finalArpAlt }));

    setSearchResults([]);
    setSearchQuery(""); // Clears the search box

    // Auto-calculate offset based on the resolved Lat/Lon
    await autoFetchGeoidOffset(centerLat, centerLon);
  };

  const handleSelectNavaid = (navaid: any) => {
    setSurfName(`${navaid.ident} - ${navaid.name} (${navaid.type})`);
    setNavCoord({
      lat: Number(navaid.lat),
      lon: Number(navaid.lon),
      alt: Number(((Number(navaid.alt_ft) || 0) * 0.3048).toFixed(2))
    });

    // Auto-select type if it matches our dropdown
    if (navaid.type.includes("VOR")) setNavType("CVOR");
    if (navaid.type === "DME") setNavType("DME");
    if (navaid.type === "NDB") setNavType("NDB");

    setSearchResults([]);
    setSearchQuery("");
  };

  // --- DASHBOARD LOGIC ---
  const handleDeleteSurface = async (surfaceId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this surface?");
    if (!confirmDelete) return;

    // FIXED: Point to the correct endpoint AND include the auth headers so Supabase knows who is deleting it!
    const res = await fetch(`${API_BASE}/delete-surface/${surfaceId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    const data = await res.json();
    if (!res.ok || data.error) return showToast(data.error || "Failed to delete from database", "error");

    // Remove from UI state
    setSavedSurfaces(prev => prev.filter(s => s.id !== surfaceId));
  };

  // --- HELPER: Safely extract first [lon, lat] from any geometry entry (coords OR quads) ---
  const getFirstCoord = (geometry: any[]): [number, number] | null => {
    if (!geometry || geometry.length === 0) return null;
    const geo = geometry[0];
    if (geo.coords && geo.coords.length >= 2) return [geo.coords[0], geo.coords[1]];
    if (geo.quads && geo.quads.length > 0 && geo.quads[0].length >= 2) return [geo.quads[0][0], geo.quads[0][1]];
    return null;
  };

  // --- THE FIX: Add explicitOffset parameter ---
  const handleDrawSurface = (surfaceInput: any | any[], explicitOffset?: number, shouldZoom: boolean = true) => {
    if (!viewerRef.current) return;

    const surfaces = Array.isArray(surfaceInput) ? surfaceInput : [surfaceInput];
    drawnSurfacesRef.current = surfaces;

    viewerRef.current.entities.removeAll();
    const entitiesToAdd: Cesium.Entity[] = [];

    const appliedOffset = explicitOffset !== undefined ? explicitOffset : geoidOffset;

    surfaces.forEach(surface => {
      if (surface.geometry) {
        surface.geometry.forEach((geo: any) => {

          // --- THE FIX: Support grouped Quad-Lists (e.g., Conical) ---
          if (geo.quads) {
            geo.quads.forEach((quadCoords: number[]) => {
              const adjustedCoords = [...quadCoords];
              for (let i = 2; i < adjustedCoords.length; i += 3) {
                adjustedCoords[i] = (adjustedCoords[i] + appliedOffset) * exaggeration;
              }
              const entity = viewerRef.current?.entities.add({
                name: geo.name, // They all share the same name!
                polygon: {
                  hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adjustedCoords),
                  perPositionHeight: true,
                  material: isGenericMode ? genericColor : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                  outline: true,
                  outlineColor: Cesium.Color.BLACK
                }
              });
              if (entity) entitiesToAdd.push(entity);
            });
          }
          // --- Standard Single-Polygon Processing ---
          else if (geo.coords) {
            const adjustedCoords = [...geo.coords];
            for (let i = 2; i < adjustedCoords.length; i += 3) {
              adjustedCoords[i] = (adjustedCoords[i] + appliedOffset) * exaggeration;
            }
            const entity = viewerRef.current?.entities.add({
              name: geo.name,
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adjustedCoords),
                perPositionHeight: true,
                material: isGenericMode ? genericColor : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                outline: true,
                outlineColor: Cesium.Color.BLACK
              }
            });
            if (entity) entitiesToAdd.push(entity);
          }
        });
      }
    });

    // --- THE FIX: Only zoom if shouldZoom is true ---
    if (shouldZoom && entitiesToAdd.length > 0) {
      viewerRef.current.zoomTo(entitiesToAdd, new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-45),
        5000
      ));
    }
  };

  // --- NEW: Watch for Generic Mode Toggles ---
  useEffect(() => {
    if (drawnSurfacesRef.current.length > 0) {
      // Explicitly pass the current state offset
      handleDrawSurface(drawnSurfacesRef.current, geoidOffset);
    }
  }, [isGenericMode]);

  // --- TOOL INTERACTION HANDLER ---
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    // Create a data source for our tool drawings if it doesn't exist
    if (!toolsDataSourceRef.current) {
      const ds = new Cesium.CustomDataSource("tools");
      viewer.dataSources.add(ds);
      toolsDataSourceRef.current = ds;
    }
    const toolsLayer = toolsDataSourceRef.current;

    // Setup Click Handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: any) => {
      if (activeTool === "none") return;

      // 1. Get Earth Coordinates strictly typed
      let cartesian: Cesium.Cartesian3 | undefined = viewer.camera.pickEllipsoid(click.position);
      const ray = viewer.camera.getPickRay(click.position);
      if (ray) {
          const globePick = viewer.scene.globe.pick(ray, viewer.scene);
          if (globePick) cartesian = globePick;
      }
      
      if (!cartesian) return;

      // --- POINT TOOL ---
      if (activeTool === "point") {
        toolsLayer.entities.removeAll(); // Clear previous
        viewer.canvas.style.cursor = "wait";
        
        // Extract unified MSL Altitude
        getTrueMslAltitude(cartesian).then(({ lat, lon, alt }) => {
            // Draw Dot
            toolsLayer.entities.add({
              position: cartesian as Cesium.Cartesian3,
              point: { pixelSize: 10, color: Cesium.Color.CYAN, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 },
              label: {
                text: `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m MSL`,
                showBackground: true,
                font: "14px monospace",
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(10, -10),
                disableDepthTestDistance: Number.POSITIVE_INFINITY // Always on top
              }
            });

            setPointResult({ lat, lon, alt });
            viewer.canvas.style.cursor = "crosshair"; // Reset back to tool cursor
        }).catch(() => { viewer.canvas.style.cursor = "crosshair"; });
      }

      // --- RULER TOOL ---
      if (activeTool === "ruler") {
        const newPts = [...rulerPts, cartesian];
        
        // Draw the point
        toolsLayer.entities.add({
            position: cartesian,
            point: { pixelSize: 8, color: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 }
        });

        if (newPts.length === 1) {
            setToolTip("Click End Point");
            setRulerPts(newPts);
        } else if (newPts.length === 2) {
            // Draw Line
            toolsLayer.entities.add({
                polyline: {
                    positions: newPts,
                    width: 3,
                    material: Cesium.Color.YELLOW,
                    depthFailMaterial: Cesium.Color.YELLOW // See through terrain
                }
            });

            // Calculate Distance
            const distM = Cesium.Cartesian3.distance(newPts[0], newPts[1]);
            const distNM = distM / 1852.0;
            
            setMeasureResult({ m: parseFloat(distM.toFixed(1)), nm: parseFloat(distNM.toFixed(2)) });
            setToolTip("Distance Measured. Click 'Reset' to start over.");
            setRulerPts(newPts); // Lock it
            
            // Add Label at midpoint
            const midpoint = Cesium.Cartesian3.lerp(newPts[0], newPts[1], 0.5, new Cesium.Cartesian3());
            toolsLayer.entities.add({
                position: midpoint,
                label: {
                    text: `${(distM/1000).toFixed(2)} km\n${distNM.toFixed(2)} NM`,
                    showBackground: true,
                    font: "bold 14px sans-serif",
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
        }
      }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Cleanup when tool changes
    return () => {
      handler.destroy();
    };
  }, [activeTool, rulerPts]); // Re-bind when state changes

  // --- PUBLIC SURFACE SEARCH LOGIC ---
  const handleSearchPublicSurfaces = async (query: string) => {
    setPubSurfQuery(query);
    try {
      const res = await fetch(`${API_BASE}/search/public-surfaces?q=${query}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setPubSurfResults(data); // Removed the slice, the backend now limits to 10 safely
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleExport = async (format: 'kml' | 'dxf' | 'geojson' | 'aixm') => {
    // FIXED: Dynamically use the 'format' variable in the URL
    const res = await fetch(`${API_BASE}/export/${format}?airport_name=${encodeURIComponent(selectedAnalysisAirport)}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      return showToast(`Export Error: ${err.detail}`, "error");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedAnalysisAirport.replace(/\s+/g, '_')}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadLogs = async () => {
    if (!logStartDate || !logEndDate) return showToast("Please select both a start and end date.", "error");
    if (new Date(logStartDate) > new Date(logEndDate)) return showToast("Start date cannot be after end date.", "error");

    const res = await fetch(`${API_BASE}/export/audit-logs?start_date=${logStartDate}&end_date=${logEndDate}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      return showToast(`Export Error: ${err.detail}`, "error");
    }

    // Trigger the silent file download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AeroCheck_Logs_${logStartDate}_to_${logEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- OFFICIAL PDF GENERATOR ---
  const generatePDF = () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    let currentY = 20; // This tracks where we are on the page vertically

    // --- 1. DYNAMIC LOGO INJECTION ---
    if (analysisResult.authority_logo) {
      try {
        // Create an invisible image element to read its true, unsquished dimensions
        const img = new window.Image();
        img.src = analysisResult.authority_logo;

        // Default dimensions just in case
        let imgWidth = 20;
        let imgHeight = 20;

        // If the browser successfully reads the image shape, calculate the perfect aspect ratio
        if (img.width && img.height) {
          imgHeight = 20; // We lock the height to 20mm
          imgWidth = imgHeight * (img.width / img.height); // Dynamically scale the width!
        }

        const imageType = analysisResult.authority_logo.includes("jpeg") || analysisResult.authority_logo.includes("jpg") ? "JPEG" : "PNG";

        doc.addImage(analysisResult.authority_logo, imageType, 14, 10, imgWidth, imgHeight);

        // Push the title down below the logo!
        currentY = 40;
      } catch (err) {
        console.warn("Failed to load Authority Logo into PDF", err);
      }
    }

    // --- 2. REPORT HEADER ---
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102); // Navy Blue
    // The text is back to being perfectly centered, but pushed down if a logo exists
    doc.text("AERONAUTICAL OBSTACLE EVALUATION REPORT", 105, currentY, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(14, currentY + 5, 196, currentY + 5);

    // --- 3. METADATA SECTION ---
    currentY += 15;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date of Analysis: ${date}`, 14, currentY);
    doc.text(`Authority / Defined By: ${analysisResult.authority_name}`, 14, currentY + 7);
    doc.text(`Evaluated Airspace: ${analysisResult.surface_name}`, 14, currentY + 14);

    // --- 4. OBSTACLE DETAILS ---
    currentY += 25;
    doc.setFont("helvetica", "bold");
    doc.text("Obstacle Details:", 14, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`Latitude:  ${obsPos.lat}°`, 20, currentY + 7);
    doc.text(`Longitude: ${obsPos.lon}°`, 20, currentY + 14);
    doc.text(`Proposed Height: ${analysisResult.obstacle_alt} m`, 20, currentY + 21);

    // --- 5. OFFICIAL DETERMINATION ---
    currentY += 35;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (analysisResult.penetration) {
      doc.setTextColor(200, 0, 0); // Red
      doc.text(`DETERMINATION: DENIED (PENETRATES SURFACES)`, 14, currentY);
    } else {
      doc.setTextColor(0, 150, 0); // Green
      doc.text(`DETERMINATION: ALLOWED (CLEAR OF SURFACES)`, 14, currentY);
    }

    // --- 6. ANALYSIS BREAKDOWN TABLE ---
    currentY += 10;
    autoTable(doc, {
      startY: currentY,
      headStyles: { fillColor: [0, 51, 102] },
      head: [['Evaluated Surface', 'Allowed Max Height (m)', 'Margin to Obstacle (m)']],
      body: analysisResult.all_surfaces.map((s: any) => [
        s.surface_name,
        s.allowed_alt,
        (s.allowed_alt - analysisResult.obstacle_alt).toFixed(2)
      ]),
    });

    // --- 7. FOOTER DISCLAIMER ---
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("This document is an automated analysis report. Please verify with local Civil Aviation Authorities.", 105, pageHeight - 10, { align: "center" });

    // --- 8. TRIGGER DOWNLOAD ---
    // --- NEW: SAVE TO AUDIT LOG (Fire and Forget) ---
    if (selectedAnalysisOwner !== 0) {
      fetch(`${API_BASE}/audit-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airport_name: selectedAnalysisAirport,
          owner_id: selectedAnalysisOwner,
          lat: obsPos.lat,
          lon: obsPos.lon,
          alt: obsPos.alt,
          limiting_surface: analysisResult.limiting_surface,
          margin: analysisResult.margin,
          penetration: analysisResult.penetration
        })
      }).catch(err => console.error("Failed to save audit log", err));
    }

    doc.save(`AeroCheck_Report_${Date.now()}.pdf`);
  };

  const handleDefine = async () => {
    if (!airportName.trim()) {
      return showToast("Please enter an Airport Name to organize your surfaces.", "error");
    }

    // 2. Auto-generate the surface name if the user didn't type one
    const finalSurfName = surfName.trim() || `${family} Surface`;
    if (family === "RNAV") {
      const r = rnavParams;
      if (r.use_if && r.use_faf && r.if_lat === r.faf_lat && r.if_lon === r.faf_lon) {
        return showToast("IF and FAF cannot be the exact same location.", "error");
      }
      if (r.use_faf && r.use_mapt && r.faf_lat === r.mapt_lat && r.faf_lon === r.mapt_lon) {
        return showToast("FAF and MAPt cannot be the exact same location.", "error");
      }
      if (r.use_mapt && r.use_ma_end && r.mapt_lat === r.ma_end_lat && r.mapt_lon === r.ma_end_lon) {
        return showToast("MAPt and Missed Approach End cannot be the exact same location.", "error");
      }
    }
    let bodyData: any = {
      airport_name: airportName,
      name: surfName,
      surface_family: family,
      runway_type: runwayType,
      t1, t2, arp_alt: arpAlt,
      vss_params: family === "VSS" ? vssParams : null,
      oas_params: family === "OAS" ? oasParams : null,
      adg: family === "OFZ" ? adg : null,
      arc_code: arcCode === "Auto" ? null : parseInt(arcCode),
      wind_spiral_params: family === "WIND_SPIRAL" ? {
        ias: wsParams.ias,
        altitude_ft: wsParams.altitude_ft,
        bank_angle: wsParams.bank_angle,
        wind_speed: wsParams.wind_speed,
        ad_elev_ft: wsParams.ad_elev_ft,
        temp_ref_c: wsParams.temp_ref_c,
        turn_direction: wsParams.turn_direction,
        inbound_bearing: wsParams.inbound_bearing
      } : null,
      holding_params: family === "HOLDING" ? {
        type: holdingParams.type,
        ias: holdingParams.ias,
        alt_ft: holdingParams.alt_ft,
        time_min: holdingParams.time_min,
        inbound_brg: holdingParams.inbound_brg,
        turn_dir: holdingParams.turn_dir,
        ad_elev_ft: holdingParams.ad_elev_ft,
        temp_ref_c: holdingParams.temp_ref_c
      } : null,
      rnav_params: family === "RNAV" ? {
        mode: rnavMode,
        alt_unit: altUnit,
        use_if: rnavParams.use_if,
        use_faf: rnavParams.use_faf,
        use_mapt: rnavParams.use_mapt,
        use_ma_end: rnavParams.use_ma_end,
        // --- THE FIX: Use rnavParams instead of the hardcoded Colombia states ---
        if_lat: rnavParams.if_lat, if_lon: rnavParams.if_lon,
        faf_lat: rnavParams.faf_lat, faf_lon: rnavParams.faf_lon, faf_alt: rnavParams.faf_alt,
        mapt_lat: rnavParams.mapt_lat, mapt_lon: rnavParams.mapt_lon, mapt_alt: rnavParams.mapt_alt,
        ma_end_lat: rnavParams.ma_end_lat, ma_end_lon: rnavParams.ma_end_lon,
        acft_cat: rnavParams.acft_cat,

        use_custom_values: useCustomRnav,
        if_xtt: rnavOverrides.if_xtt, if_att: rnavOverrides.if_att, if_sw: rnavOverrides.if_sw,
        faf_xtt: rnavOverrides.faf_xtt, faf_att: rnavOverrides.faf_att, faf_sw: rnavOverrides.faf_sw,
        mapt_xtt: rnavOverrides.mapt_xtt, mapt_att: rnavOverrides.mapt_att, mapt_sw: rnavOverrides.mapt_sw,
        mapt_soc: rnavOverrides.mapt_soc ? Number(rnavOverrides.mapt_soc) : null,
      } : null,
      navaid_params: family === "NAVAID" ? {
        n_type: navType,
        lat: navCoord.lat,
        lon: navCoord.lon,
        alt: navCoord.alt,
        bearing: navBearing,
        thr_lat: navThr.lat,
        thr_lon: navThr.lon,
        thr_alt: navThr.alt
      } : null,
      heliport_params: family === "HELIPORT" ? {
        fato_type: heliParams.fatoType,
        lat: heliParams.lat, lon: heliParams.lon, alt: heliParams.alt,
        bearing: heliParams.bearing,
        inner_width: heliParams.innerWidth, start_offset: heliParams.startOffset,
        has_pins_vss: heliParams.hasPinsVss,
        approach_sections: [
          { length: heliParams.appS1Len, slope_pct: heliParams.appS1Slope, divergence_pct: heliParams.appS1Div, max_outer_width: heliParams.appS1MaxW || null },
          { length: heliParams.appS2Len, slope_pct: heliParams.appS2Slope, divergence_pct: heliParams.appS2Div, max_outer_width: heliParams.appS2MaxW || null },
          { length: heliParams.appS3Len, slope_pct: heliParams.appS3Slope, divergence_pct: heliParams.appS3Div, max_outer_width: heliParams.appS3MaxW || null },
        ].filter(s => s.length > 0),
        takeoff_sections: [
          { length: heliParams.tkofS1Len, slope_pct: heliParams.tkofS1Slope, divergence_pct: heliParams.tkofS1Div, max_outer_width: heliParams.tkofS1MaxW || null },
          { length: heliParams.tkofS2Len, slope_pct: heliParams.tkofS2Slope, divergence_pct: heliParams.tkofS2Div, max_outer_width: heliParams.tkofS2MaxW || null },
          { length: heliParams.tkofS3Len, slope_pct: heliParams.tkofS3Slope, divergence_pct: heliParams.tkofS3Div, max_outer_width: heliParams.tkofS3MaxW || null },
        ].filter(s => s.length > 0),
      } : null,
      apv_baro_params: family === "APV_BARO" ? {
        thr_lat: apvParams.thrLat, thr_lon: apvParams.thrLon, thr_alt: apvParams.thrAlt,
        bearing: apvParams.bearing,
        vpa_deg: apvParams.vpaDeg, rdh: apvParams.rdh,
        aerodrome_elev_ft: apvParams.aeroElftFt,
        faf_lat: apvParams.fafLat, faf_lon: apvParams.fafLon, faf_alt: apvParams.fafAlt,
        mapt_lat: apvParams.maptLat, mapt_lon: apvParams.maptLon,
        ma_gradient_pct: apvParams.maGradPct,
        acft_category: apvParams.acftCat,
        height_fap: apvParams.heightFap, // <-- ADD THIS
        delta_h: apvParams.deltaH       // <-- ADD THIS
      } : null,
      custom_coords: family === "CUSTOM" ? customPoints : undefined,
      // --- NEW: Custom OLS Payload Mapper ---
      custom_ols_params: runwayType === "custom" ? {
        draw_strip: cOls.draw_strip, draw_approach: cOls.draw_app, draw_departure: cOls.draw_dep,
        draw_transitional: cOls.draw_trans, draw_ihs: cOls.draw_ihs, draw_conical: cOls.draw_conical,
        draw_balked: cOls.draw_balked, draw_inner_approach: cOls.draw_in_app, draw_inner_transitional: cOls.draw_in_trans,
        strip_end: cOls.strip_end, strip_width: cOls.strip_width, ihs_radius: cOls.ihs_radius,
        app_div: cOls.app_div / 100,
        app_sections: [
          { len: cOls.app_s1_len, slope: cOls.app_s1_slope / 100 },
          { len: cOls.app_s2_len, slope: cOls.app_s2_slope / 100 },
          { len: cOls.app_s3_len, slope: cOls.app_s3_slope / 100 }
        ].filter(s => s.len > 0), // Ignore 0-length sections
        trans_slope: cOls.trans_slope / 100,
        dep_inner: cOls.dep_inner, dep_start: cOls.dep_start, dep_div: cOls.dep_div / 100,
        dep_slope: cOls.dep_slope / 100, dep_len: cOls.dep_len, dep_max_w: cOls.dep_max_w,
        conical_slope: cOls.conical_slope / 100, conical_height: cOls.conical_height,
        balked_start: cOls.balked_start, balked_slope: cOls.balked_slope / 100, balked_div: cOls.balked_div / 100,
        inner_app_len: cOls.in_app_len, inner_app_hw: cOls.in_app_hw, inner_app_slope: cOls.in_app_slope / 100, inner_app_offset: cOls.in_app_offset
      } : undefined
    };

    if (family === "CUSTOM") {
      const lines = customPoints.split("\n");
      const polygons: any[] = []; // Changed to store whole polygons

      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        const parts = cleanLine.split(",").map(s => s.trim());

        // VALIDATION: We need at least Name + 3 points (10 parts)
        if (parts.length < 10 || (parts.length - 1) % 3 !== 0) {
          console.warn(`Skipping invalid line: ${line}`);
          return;
        }

        const surfaceId = parts[0];

        // Keep the points grouped in an array for this specific polygon line
        const polyCoords = [];
        for (let i = 1; i < parts.length; i += 3) {
          polyCoords.push(
            parseFloat(parts[i]),     // Lat
            parseFloat(parts[i + 1]),   // Lon
            parseFloat(parts[i + 2])    // Alt
          );
        }

        // Push the entire polygon object
        polygons.push({
          id: surfaceId,
          coords: polyCoords
        });
      });

      if (polygons.length === 0) return showToast("Please enter valid polygon coordinates.", "error");

      bodyData = { ...bodyData, custom_coords: polygons };
    }

    setIsCreating(true); // START LOADING
      try {
        const res = await fetch(`${API_BASE}/create-surface`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(bodyData),
        });

        // 1. SAFELY PARSE FASTAPI EXCEPTIONS
        if (!res.ok) {
          const errorData = await res.json();
          // Extract the clean "detail" message sent by FastAPI, or fallback to a generic error
          throw new Error(errorData.detail || errorData.error || "Failed to create surface on the server.");
        }

        // 2. PARSE SUCCESSFUL RESPONSE
        const data = await res.json();
        
        // Catch internal soft-errors (like ghost-saves returning {error: "..."})
        if (data.error) throw new Error(data.error);

        // 3. DRAW AND SAVE
        if (viewerRef.current && data.geometry) {
          let newOffset = geoidOffset;
          const firstCoord = getFirstCoord(data.geometry);
          if (firstCoord) {
            newOffset = await autoFetchGeoidOffset(firstCoord[1], firstCoord[0]);
          }

          handleDrawSurface([data], newOffset);
          setSavedSurfaces(prev => [...prev, data]);
          setSelectedAnalysisAirport(data.airport_name);
          setSelectedAnalysisOwner(0);

          showToast(`${finalSurfName} created and saved successfully!`, "success");
        }

      } catch (err: any) {
        console.error("Save error details:", err);
        
        // Check for hard 404 connection errors
        if (err.message.includes("404")) {
          showToast("Error 404: The system couldn't find the server route.", "error");
        } else {
          // This will now perfectly display ONLY the clean string:
          // "Storage limit reached. Your account allows a maximum of 1 airport(s)."
          showToast(err.message, "error");
        }
      } finally {
        setIsCreating(false);
      }
    };

  if (!mounted) return <div style={{ backgroundColor: "#111", height: "100vh" }} />;
    if (resetToken) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "sans-serif" }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", width: "350px", textAlign: "center" }}>
            <h3 style={{ color: "#0b1b3d", marginTop: 0 }}>Reset Your Password</h3>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>Enter a new secure password for your Altitude Nexus account.</p>

            <input
              type="password"
              style={{ ...inputStyle, marginBottom: "15px" }}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New Password"
            />

            <button
              style={{ ...activeTabBtn, width: "100%", padding: "12px", backgroundColor: "#28a745" }}
              onClick={async () => {
                if (!newPassword) return showToast("Please enter a new password", "error");

                const res = await fetch(`${API_BASE}/reset-password`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: resetToken, new_password: newPassword })
                });

                const data = await res.json();
                if (!res.ok) return showToast(`Error: ${data.detail}`, "error");

                showToast("Password updated successfully! You can now log in.", "success");
                window.location.href = "/"; // Send them back to the main app to log in natively
              }}
            >
              Save New Password
            </button>
          </div>
        </div>
      );
    }

  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      {/* GLOBAL MODERN STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        input::placeholder, textarea::placeholder { color: #666666 !important; opacity: 1; font-weight: normal; }
        
        /* Modern Scrollbars for Sidebar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Segmented Control Tabs */
        .segmented-control { 
          display: flex; 
          background: #e2e8f0;
          padding: 5px; 
          border-radius: 8px; 
          gap: 4px; 
          margin-bottom: 20px; 
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
        }
        .segmented-btn { 
          flex: 1; padding: 8px; font-size: 13px; font-weight: 600; color: #475569; 
          background: transparent; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; 
        }
        .segmented-btn:hover { 
          color: #073763; 
          background: rgba(255,255,255,0.4); 
        }
        .segmented-btn.active { 
          background: #073763; color: #ffffff; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.2); 
        }
        @keyframes slideDown {
          from { top: -50px; opacity: 0; }
          to { top: 24px; opacity: 1; }
        }
      `}</style>
      {/* --- AESTHETIC TOAST NOTIFICATION --- */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
          backgroundColor: toast.type === 'error' ? '#fef2f2' : toast.type === 'success' ? '#f0fdf4' : '#f0f9ff',
          color: toast.type === 'error' ? '#991b1b' : toast.type === 'success' ? '#166534' : '#075985',
          padding: "16px 24px", borderRadius: theme.radius, boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : toast.type === 'success' ? '#86efac' : '#7dd3fc'}`,
          zIndex: 9999, display: "flex", alignItems: "center", gap: "12px",
          fontWeight: 600, fontSize: "14px", minWidth: "320px", maxWidth: "80%", justifyContent: "space-between",
          animation: "slideDown 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>{toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "inherit", opacity: 0.6 }}>✕</button>
        </div>
      )}
      {/* Inner canvas: fixed DESIGN_W wide, scaled to fit mobile screens.
            transform-origin "top left" means the top-left corner stays pinned
            and the content shrinks towards it, just like "desktop mode" in Safari/Chrome. */}
      <div style={{
        position: "relative",
        width: vpScale < 1 ? `${DESIGN_W}px` : "100%",
        height: vpScale < 1 ? scaledH : "100%",
        transformOrigin: "top left",
        transform: vpScale < 1 ? `scale(${vpScale})` : "none",
        overflow: "hidden",
      }}>
        {/* CESIUM MAP CONTAINER */}
        <div ref={cesiumContainer} style={{ width: "100%", height: "100%" }} />

        {/* --- NEW: ALTITUDE NEXUS BRANDING LINK --- */}
        <a
          href="https://www.altitudenexus.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            bottom: "5px",
            left: "5px",
            backgroundColor: "#0b1b3d",
            color: "#ffffff",
            padding: "10px 130px",
            borderRadius: "6px",
            zIndex: 10,
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
            textDecoration: "none",
            cursor: "pointer",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
            borderTop: "2px solid #4a90d9",
            transition: "background-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "#122a5e";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.7)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "#0b1b3d";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
          }}
        >
          <img
            src="/LOGO.png"
            alt="Altitude Nexus"
            style={{
              height: "100%",
              width: "auto",
              maxHeight: "36px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontWeight: "900", letterSpacing: "3px", fontSize: "14px" }}>
              ALTITUDE NEXUS ↗
            </span>
            <span style={{ fontSize: "10px", opacity: 0.6, letterSpacing: "1px" }}>
              Visit main site - Contact
            </span>
          </div>
        </a>

        {/* --- QUICK TOOLS WIDGET (TOP RIGHT) --- */}
        <div style={{
          position: "absolute",
          top: "70px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end", // Align to right
          gap: "10px",
          zIndex: 90 // Above map
        }}>

          {/* Toggle Button (Small Icon) */}
          <button
            onClick={() => setShowTools(!showTools)}
            style={{
              width: "40px", height: "40px", borderRadius: "50%",
              backgroundColor: "white", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center"
            }}
            title="Toggle Tools"
          >
            {showTools ? "✕" : "🛠️"}
          </button>

          {/* The Tool Panel */}
          {showTools && (
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "15px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              width: "220px", display: "flex", flexDirection: "column", gap: "10px"
            }}>
              <strong style={{ fontSize: "12px", color: "#555", textTransform: "uppercase" }}>Quick Tools</strong>

              {/* Tool Buttons */}
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc",
                    backgroundColor: activeTool === "ruler" ? "#0b1b3d" : "white",
                    color: activeTool === "ruler" ? "white" : "#333",
                    cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                  }}
                  onClick={() => {
                    clearTools();
                    setActiveTool("ruler");
                    setToolTip("Click Start Point");
                  }}
                >
                  📏 Ruler
                </button>
                <button
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc",
                    backgroundColor: activeTool === "point" ? "#0b1b3d" : "white",
                    color: activeTool === "point" ? "white" : "#333",
                    cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                  }}
                  onClick={() => {
                    clearTools();
                    setActiveTool("point");
                  }}
                >
                  📍 Point
                </button>
              </div>

              {/* Instructions / Status */}
              {activeTool !== "none" && (
                <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic", textAlign: "center" }}>
                  {toolTip}
                </div>
              )}

              {/* Results Display */}
              {activeTool === "ruler" && measureResult && (
                <div style={{ backgroundColor: "#f0f8ff", padding: "8px", borderRadius: "4px", fontSize: "12px", border: "1px solid #bde0fe" }}>
                  <div><strong>Dist (m):</strong> {measureResult.m.toLocaleString()} m</div>
                  <div><strong>Dist (NM):</strong> {measureResult.nm.toLocaleString()} NM</div>
                </div>
              )}

              {activeTool === "point" && pointResult && (
                <div style={{ backgroundColor: "#f0f8ff", padding: "8px", borderRadius: "4px", fontSize: "12px", border: "1px solid #bde0fe" }}>
                  <div><strong>Lat:</strong> {pointResult.lat}</div>
                  <div><strong>Lon:</strong> {pointResult.lon}</div>
                  <div><strong>Alt:</strong> {pointResult.alt} m</div>
                </div>
              )}

              {/* Clear Button */}
              {activeTool !== "none" && (
                <button
                  onClick={clearTools}
                  style={{
                    padding: "5px", backgroundColor: "#e74c3c", color: "white", border: "none",
                    borderRadius: "4px", cursor: "pointer", fontSize: "11px"
                  }}
                >
                  Clear / Stop
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- NEW: SIDEBAR TOGGLE ARROW --- */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: "absolute",
            top: "20px",
            left: isSidebarOpen ? "380px" : "0px", // Slides with the menu
            zIndex: 20,
            width: "35px",
            height: "45px",
            backgroundColor: "rgba(255,255,255,0.95)",
            color: "#0b1b3d",
            border: "none",
            borderRadius: "0 8px 8px 0", // Rounded on the right side
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "4px 0px 10px rgba(0,0,0,0.1)",
            transition: "left 0.3s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>

        {/* SINGLE INTERACTIVE SIDEBAR */}
        <div style={{
          ...sidebarStyle,
          left: isSidebarOpen ? "20px" : "-400px",
          transition: "left 0.3s ease-in-out"
        }}>
          
          {/* VISUALIZATION TOGGLES */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", display: "flex", gap: "6px", alignItems: "center", color: theme.text, cursor: "pointer" }}>
              <input type="checkbox" checked={isXRayMode} onChange={e => setIsXRayMode(e.target.checked)} />
              X-Ray Mode (See surfaces through terrain)
            </label>
            <label style={{ fontSize: "12px", display: "flex", gap: "6px", alignItems: "center", color: theme.text, cursor: "pointer" }}>
              <input type="checkbox" checked={isGenericMode} onChange={e => setIsGenericMode(e.target.checked)} />
              Generic Color Surfaces
            </label>
            {/* --- 3D Buildings Checkbox --- */}
            <label
              style={{
                fontSize: "12px", display: "flex", alignItems: "center", gap: "6px",
                color: user?.is_premium ? theme.text : theme.textMuted,
                cursor: user?.is_premium ? "pointer" : "not-allowed"
              }}
              title={!user?.is_premium ? "Upgrade to Premium to view 3D buildings" : ""}
            >
              <input
                type="checkbox"
                checked={showBuildings}
                onChange={e => setShowBuildings(e.target.checked)}
                disabled={!user?.is_premium}
              />
              3D Buildings {!user?.is_premium && <span style={{ color: "gold" }}>★</span>}
            </label>
          </div>

          {/* TAB NAVIGATION (Modern Segmented Control) */}
          <div className="segmented-control">
            <button className={`segmented-btn ${activeTab === "define" ? "active" : ""}`} onClick={() => setActiveTab("define")}>DEFINE</button>
            <button className={`segmented-btn ${activeTab === "analyze" ? "active" : ""}`} onClick={() => setActiveTab("analyze")}>ANALYZE</button>
            <button className={`segmented-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>DASHBOARD</button>
          </div>

          {/* --- DEFINE TAB --- */}
          {activeTab === "define" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* --- OPEN SOURCE SEARCH --- */}
              <div style={{ backgroundColor: theme.lightBlue, padding: "12px", borderRadius: theme.radiusSm, border: "1px solid #cce5ff", position: "relative" }}>
                <input
                  style={inputStyle}
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={family === "NAVAID" ? "🔍 Search Navaid (e.g. JFK)" : "🔍 Search Airport (e.g. EGLL)"}
                  onBlur={() => setTimeout(() => {
                    setSearchResults([]);
                    setSearchQuery("");
                  }, 200)}
                />

                {/* SEARCH RESULTS DROPDOWN */}
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: theme.bg,
                  border: `1px solid ${theme.border}`, zIndex: 9999, maxHeight: "300px", overflowY: "auto",
                  boxShadow: theme.shadowHover, borderRadius: theme.radiusSm, marginTop: "4px"
                }}>
                  {family === "NAVAID" ? (
                    searchResults.map((nav, idx) => (
                      <div key={idx} onClick={() => handleSelectNavaid(nav)} style={{ padding: "10px", borderBottom: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "13px" }}>
                        <strong style={{ color: theme.navy }}>{nav.ident}</strong> - <span style={{ color: theme.text }}>{nav.name}</span> <span style={{ color: theme.textMuted }}>({nav.type})</span>
                      </div>
                    ))
                  ) : (
                    searchResults.map((apt, idx) => (
                      <div key={idx} style={{ padding: "10px", borderBottom: `1px solid ${theme.border}`, fontSize: "13px" }}>
                        <strong style={{ color: theme.navy }}>{apt.ident}</strong> - <span style={{ color: theme.text }}>{apt.name}</span>
                        <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {apt.runways && apt.runways.length > 0 ? (
                            apt.runways.map((rwy: any, rIdx: number) => (
                              <button
                                key={rIdx}
                                onClick={() => handleSelectRunway(apt, rwy)}
                                style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                              >
                                RWY {rwy.le_ident}/{rwy.he_ident}
                              </button>
                            ))
                          ) : (
                            <button
                              onClick={() => handleSelectRunway(apt)}
                              style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#15803d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                            >
                              Select Heliport Base
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* --------------------------------- */}

              <div>
                <label style={labelStyle}>Airport / Group Name</label>
                <input style={inputStyle} value={airportName} onChange={e => setAirportName(e.target.value)} placeholder="e.g. Heathrow (EGLL)" />
              </div>

              <div>
                <label style={labelStyle}>Surface Name <span style={{color: theme.textMuted, fontWeight: "normal", textTransform: "none"}}>(Optional)</span></label>
                <input style={inputStyle} value={surfName} onChange={e => setSurfName(e.target.value)} placeholder="e.g., RWY 09/27" />
              </div>

              <div>
                <label style={labelStyle}>Surface Family</label>
                <select style={inputStyle} value={family} onChange={e => setFamily(e.target.value)}>
                  <option value="OLS">OLS (Annex 14)</option>
                  <option value="RNAV">RNAV / RNP APCH (Straight MA only)</option>
                  <option value="VSS">VSS</option>
                  <option value="OAS">OAS (ILS)</option>
                  <option value="APV_BARO">OAS (APV Baro-VNAV)</option>
                  <option value="OFZ">OFZ / OES</option>
                  <option value="NAVAID">Navaid BRA</option>
                  <option value="CUSTOM">Import custom Surfaces</option>
                  <option value="HELIPORT">Heliport OLS</option>
                </select>
              </div>

              {/* --- ONLY SHOW T1, T2, and ARP for Aeroplane OLS, OFZ, VSS, and OAS --- */}
              {(family === "OLS" || family === "OFZ" || family === "VSS" || family === "OAS" || family === "APV_BARO") && (
                <div style={{ backgroundColor: theme.bgOff, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                  
                  {family === "OAS" && (
                    <div style={{ fontSize: "11px", color: theme.navy, backgroundColor: theme.lightBlue, padding: "8px", borderRadius: "4px", border: "1px solid #b3d9f7", lineHeight: "1.5" }}>
                      <strong>T1</strong> = ILS Approach Threshold (origin).<br/><strong>T2</strong> = Runway Stop-End.<br/>Coordinate system derives approach bearing and length from T1→T2.
                    </div>
                  )}

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Threshold 1 (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT1, t1)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({ ...t1, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({ ...t1, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({ ...t1, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Threshold 2 (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT2, t2)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t2.lat} onChange={e => setT2({ ...t2, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t2.lon} onChange={e => setT2({ ...t2, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t2.alt} onChange={e => setT2({ ...t2, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  <div>
                    <label style={{...labelStyle, marginTop: 0}}>ARP Altitude (m)</label>
                    <input style={inputStyle} type="number" value={arpAlt} onChange={e => setArpAlt(+e.target.value)} />
                  </div>
                </div>
              )}

              {/* NEW RUNWAY TYPE DROPDOWN (Only show for OFZ) */}
              {(family === "OFZ") && (
                <div>
                  <label style={labelStyle}>Runway Type</label>
                  <select style={inputStyle} value={runwayType} onChange={e => setRunwayType(e.target.value)}>
                    <option value="non_instrument">Non-Instrument</option>
                    <option value="non_precision">Non-Precision Approach</option>
                    <option value="precision">Precision Approach</option>
                  </select>
                </div>
              )}

              {/* --- STANDARD OLS SETTINGS --- */}
              {family === "OLS" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Runway Type</label>
                      <select style={inputStyle} value={runwayType} onChange={e => setRunwayType(e.target.value)}>
                        <option value="non_instrument">Non-Instrument</option>
                        <option value="non_precision">Non-Precision</option>
                        <option value="precision">Precision</option>
                        <option value="custom">⚙️ Custom</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>ARC Override</label>
                      <select style={inputStyle} value={arcCode} onChange={e => setArcCode(e.target.value)}>
                        <option value="Auto">Auto</option>
                        <option value="1">Code 1</option>
                        <option value="2">Code 2</option>
                        <option value="3">Code 3</option>
                        <option value="4">Code 4</option>
                      </select>
                    </div>
                  </div>

                  {/* --- NEW: CUSTOM OLS CONFIGURATOR --- */}
                  {runwayType === "custom" && (
                    <div style={{ backgroundColor: "#e2e8f0", padding: "10px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                      <p style={{ fontSize: "12px", color: theme.navy, margin: "0 0 4px 0", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Custom Parameters
                      </p>

                      {/* Helper functions to keep UI code incredibly clean and perfectly sized */}
                      {(() => {
                        const ParamInput = ({ label, value, onChange }: any) => (
                          <div style={{ display: "flex", flexDirection: "column", width: "65px" }}>
                            <span style={{ fontSize: "10px", color: theme.textMuted, marginBottom: "2px", fontWeight: "bold", whiteSpace: "nowrap" }}>{label}</span>
                            <input
                              type="number"
                              style={{ padding: "6px", fontSize: "12px", borderRadius: "4px", border: `1px solid ${theme.border}`, width: "100%", boxSizing: "border-box", backgroundColor: "#fff", color: theme.text }}
                              value={value}
                              onChange={onChange}
                            />
                          </div>
                        );

                        const CustomRow = ({ label, toggle, inputs }: any) => (
                          <div style={{ display: "flex", flexDirection: "column", padding: "10px", backgroundColor: cOls[toggle as keyof typeof cOls] ? "#ffffff" : theme.bgOff, borderRadius: "4px", border: `1px solid ${theme.border}`, transition: "all 0.2s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: cOls[toggle as keyof typeof cOls] ? "8px" : "0" }}>
                              <input type="checkbox" checked={cOls[toggle as keyof typeof cOls] as boolean} onChange={(e) => setCOls({ ...cOls, [toggle]: e.target.checked })} style={{ cursor: "pointer" }} />
                              <strong style={{ fontSize: "12px", color: cOls[toggle as keyof typeof cOls] ? theme.navy : theme.textMuted }}>{label}</strong>
                            </div>
                            {cOls[toggle as keyof typeof cOls] && (
                              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginLeft: "22px" }}>
                                {inputs}
                              </div>
                            )}
                          </div>
                        );

                        return (
                          <>
                            <CustomRow label="Basic Strip" toggle="draw_strip" inputs={
                              <>
                                <ParamInput label="End Dist." value={cOls.strip_end} onChange={(e: any) => setCOls({ ...cOls, strip_end: +e.target.value })} />
                                <ParamInput label="Width (m)" value={cOls.strip_width} onChange={(e: any) => setCOls({ ...cOls, strip_width: +e.target.value })} />
                              </>
                            } />
                            {/* ... (The rest of your custom inputs are fine as they are, just inheriting the modern style) ... */}
                            <CustomRow label="Approach Surface" toggle="draw_app" inputs={
                              <>
                                <ParamInput label="Div. (%)" value={cOls.app_div} onChange={(e: any) => setCOls({ ...cOls, app_div: +e.target.value })} />
                                <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }}></div>
                                <ParamInput label="Sec 1 Len" value={cOls.app_s1_len} onChange={(e: any) => setCOls({ ...cOls, app_s1_len: +e.target.value })} />
                                <ParamInput label="Sec 1 Slope" value={cOls.app_s1_slope} onChange={(e: any) => setCOls({ ...cOls, app_s1_slope: +e.target.value })} />
                                <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }}></div>
                                <ParamInput label="Sec 2 Len" value={cOls.app_s2_len} onChange={(e: any) => setCOls({ ...cOls, app_s2_len: +e.target.value })} />
                                <ParamInput label="Sec 2 Slope" value={cOls.app_s2_slope} onChange={(e: any) => setCOls({ ...cOls, app_s2_slope: +e.target.value })} />
                                <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }}></div>
                                <ParamInput label="Sec 3 Len" value={cOls.app_s3_len} onChange={(e: any) => setCOls({ ...cOls, app_s3_len: +e.target.value })} />
                                <ParamInput label="Sec 3 Slope" value={cOls.app_s3_slope} onChange={(e: any) => setCOls({ ...cOls, app_s3_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Take-off Climb Surface" toggle="draw_dep" inputs={
                              <>
                                <ParamInput label="Start Offset" value={cOls.dep_start} onChange={(e: any) => setCOls({ ...cOls, dep_start: +e.target.value })} />
                                <ParamInput label="Inner W." value={cOls.dep_inner} onChange={(e: any) => setCOls({ ...cOls, dep_inner: +e.target.value })} />
                                <ParamInput label="Max W." value={cOls.dep_max_w} onChange={(e: any) => setCOls({ ...cOls, dep_max_w: +e.target.value })} />
                                <ParamInput label="Div. (%)" value={cOls.dep_div} onChange={(e: any) => setCOls({ ...cOls, dep_div: +e.target.value })} />
                                <ParamInput label="Length (m)" value={cOls.dep_len} onChange={(e: any) => setCOls({ ...cOls, dep_len: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.dep_slope} onChange={(e: any) => setCOls({ ...cOls, dep_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Transitional Surface" toggle="draw_trans" inputs={
                              <ParamInput label="Slope (%)" value={cOls.trans_slope} onChange={(e: any) => setCOls({ ...cOls, trans_slope: +e.target.value })} />
                            } />
                            <CustomRow label="Inner Horizontal Surface" toggle="draw_ihs" inputs={
                              <ParamInput label="Radius (m)" value={cOls.ihs_radius} onChange={(e: any) => setCOls({ ...cOls, ihs_radius: +e.target.value })} />
                            } />
                            <CustomRow label="Conical Surface" toggle="draw_conical" inputs={
                              <>
                                <ParamInput label="Height (m)" value={cOls.conical_height} onChange={(e: any) => setCOls({ ...cOls, conical_height: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.conical_slope} onChange={(e: any) => setCOls({ ...cOls, conical_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Balked Landing Surface" toggle="draw_balked" inputs={
                              <>
                                <ParamInput label="Start Offset" value={cOls.balked_start} onChange={(e: any) => setCOls({ ...cOls, balked_start: +e.target.value })} />
                                <ParamInput label="Div. (%)" value={cOls.balked_div} onChange={(e: any) => setCOls({ ...cOls, balked_div: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.balked_slope} onChange={(e: any) => setCOls({ ...cOls, balked_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Inner Approach Surface" toggle="draw_in_app" inputs={
                              <>
                                <ParamInput label="Offset" value={cOls.in_app_offset} onChange={(e: any) => setCOls({ ...cOls, in_app_offset: +e.target.value })} />
                                <ParamInput label="Half-W (m)" value={cOls.in_app_hw} onChange={(e: any) => setCOls({ ...cOls, in_app_hw: +e.target.value })} />
                                <ParamInput label="Length (m)" value={cOls.in_app_len} onChange={(e: any) => setCOls({ ...cOls, in_app_len: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.in_app_slope} onChange={(e: any) => setCOls({ ...cOls, in_app_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Inner Transitional" toggle="draw_in_trans" inputs={<span style={{ fontSize: "11px", color: theme.textMuted, marginTop: "4px" }}>Derived from Inner Approach & Strip settings.</span>} />
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
              {/* DYNAMIC HELIPORT FIELDS */}
              {family === "HELIPORT" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "12px", border: `1px solid ${theme.border}` }}>

                  {/* TYPE & PRESET */}
                  <div style={{ display: "flex", gap: "10px", paddingBottom: "12px", borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>FATO Type</label>
                      <select style={inputStyle} value={heliParams.fatoType} onChange={e => { setHeliParams({ ...heliParams, fatoType: e.target.value }); setHeliPreset("custom"); }}>
                        <option value="non_instrument">Non-Instrument</option>
                        <option value="non_precision">Non-Precision Approach</option>
                        <option value="precision">Precision Approach</option>
                      </select>
                    </div>
                    {heliParams.fatoType === "non_instrument" && (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", marginTop: "18px" }}>
                        <input type="checkbox" id="hasPinsVss" checked={heliParams.hasPinsVss} onChange={e => setHeliParams({ ...heliParams, hasPinsVss: e.target.checked })} style={{ cursor: "pointer" }} />
                        <label htmlFor="hasPinsVss" style={{ fontSize: "11px", fontWeight: "bold", color: theme.textMuted, cursor: "pointer", lineHeight: 1.2 }}>PinS + VSS<br/>(transitionals)</label>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>Annex 14 Presets</label>
                      <select style={inputStyle} value={heliPreset} onChange={handleHeliPresetChange}>
                        <option value="custom">Custom Parameters</option>
                        <option value="cat_a">Slope Cat A (PC1)</option>
                        <option value="cat_b">Slope Cat B (PC3)</option>
                        <option value="cat_c">Slope Cat C (PC2)</option>
                        <option value="non_precision">Inst. Non-Precision</option>
                        <option value="precision">Inst. Precision</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>Heliport FATO Center (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setHeliParams, heliParams)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={heliParams.lat} onChange={e => setHeliParams({ ...heliParams, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={heliParams.lon} onChange={e => setHeliParams({ ...heliParams, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={heliParams.alt} onChange={e => setHeliParams({ ...heliParams, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Take-off Bearing (°)</label>
                      <input style={inputStyle} type="number" value={heliParams.bearing} onChange={e => setHeliParams({ ...heliParams, bearing: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Safety Area W. (m)</label>
                      <input style={inputStyle} type="number" value={heliParams.innerWidth} onChange={e => setHeliParams({ ...heliParams, innerWidth: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Start Offset (m)</label>
                      <input style={inputStyle} type="number" value={heliParams.startOffset} onChange={e => setHeliParams({ ...heliParams, startOffset: +e.target.value })} />
                    </div>
                  </div>

                  {/* MULTI-SECTION BUILDER */}
                  <div style={{ backgroundColor: theme.bg, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <label style={{ ...labelStyle, marginTop: 0, color: "#15803d" }}>Approach Surface (Inbound)</label>
                    <div style={{ display: "flex", gap: "5px", fontSize: "10px", fontWeight: "bold", color: theme.textMuted, marginBottom: "4px" }}>
                      <span style={{ flex: 1 }}>Section</span><span style={{ flex: 1 }}>Length (m)</span><span style={{ flex: 1 }}>Slope (%)</span><span style={{ flex: 1 }}>Div (%)</span><span style={{ flex: 1 }}>MaxW (m)</span>
                    </div>
                    {[
                      { id: 1, lbl: "1 (Inner)", len: heliParams.appS1Len, slp: heliParams.appS1Slope, div: heliParams.appS1Div, max: heliParams.appS1MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 2, lbl: "2 (Mid)", len: heliParams.appS2Len, slp: heliParams.appS2Slope, div: heliParams.appS2Div, max: heliParams.appS2MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 3, lbl: "3 (Outer)", len: heliParams.appS3Len, slp: heliParams.appS3Slope, div: heliParams.appS3Div, max: heliParams.appS3MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) }
                    ].map(sec => (
                      <div key={sec.id} style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                        <span style={{ flex: 1, fontSize: "11px", alignSelf: "center", fontWeight: 600, color: theme.navy }}>{sec.lbl}</span>
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.len} onChange={e => { sec.set({ [`appS${sec.id}Len`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.slp} onChange={e => { sec.set({ [`appS${sec.id}Slope`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.div} onChange={e => { sec.set({ [`appS${sec.id}Div`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" placeholder="—" value={sec.max ?? ""} onChange={e => { sec.set({ [`appS${sec.id}MaxW`]: e.target.value ? +e.target.value : null }); setHeliPreset("custom"); }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor: theme.bg, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <label style={{ ...labelStyle, marginTop: 0, color: "#b91c1c" }}>Take-off Climb Surface (Outbound)</label>
                    <div style={{ display: "flex", gap: "5px", fontSize: "10px", fontWeight: "bold", color: theme.textMuted, marginBottom: "4px" }}>
                      <span style={{ flex: 1 }}>Section</span><span style={{ flex: 1 }}>Length (m)</span><span style={{ flex: 1 }}>Slope (%)</span><span style={{ flex: 1 }}>Div (%)</span><span style={{ flex: 1 }}>MaxW (m)</span>
                    </div>
                    {[
                      { id: 1, lbl: "1 (Inner)", len: heliParams.tkofS1Len, slp: heliParams.tkofS1Slope, div: heliParams.tkofS1Div, max: heliParams.tkofS1MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 2, lbl: "2 (Mid)", len: heliParams.tkofS2Len, slp: heliParams.tkofS2Slope, div: heliParams.tkofS2Div, max: heliParams.tkofS2MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 3, lbl: "3 (Outer)", len: heliParams.tkofS3Len, slp: heliParams.tkofS3Slope, div: heliParams.tkofS3Div, max: heliParams.tkofS3MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) }
                    ].map(sec => (
                      <div key={sec.id} style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                        <span style={{ flex: 1, fontSize: "11px", alignSelf: "center", fontWeight: 600, color: theme.navy }}>{sec.lbl}</span>
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.len} onChange={e => { sec.set({ [`tkofS${sec.id}Len`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.slp} onChange={e => { sec.set({ [`tkofS${sec.id}Slope`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.div} onChange={e => { sec.set({ [`tkofS${sec.id}Div`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" placeholder="—" value={sec.max ?? ""} onChange={e => { sec.set({ [`tkofS${sec.id}MaxW`]: e.target.value ? +e.target.value : null }); setHeliPreset("custom"); }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- OAS ICAO CONFIGURATOR --- */}
              {family === "OAS" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  {/* NAVAID DATA */}
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Navigation Aid Data</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Approach Cat</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={oasParams.appCat} onChange={e => setOasParams({ ...oasParams, appCat: e.target.value })}>
                          <option value="ILS CAT I">ILS CAT I</option>
                          <option value="ILS CAT II">ILS CAT II</option>
                          <option value="ILS CAT II (Autopilot)">ILS CAT II (Autopilot)</option>
                          <option value="APV SBAS I">APV SBAS I</option>
                          <option value="APV SBAS II">APV SBAS II</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>GP/VPA (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={oasParams.glidePath} onChange={e => setOasParams({ ...oasParams, glidePath: +e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>RDH (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={oasParams.rdh} onChange={e => setOasParams({ ...oasParams, rdh: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>LOC-THR (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={oasParams.locThrDist} onChange={e => setOasParams({ ...oasParams, locThrDist: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Course W. (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={oasParams.courseWidth} onChange={e => setOasParams({ ...oasParams, courseWidth: +e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* AIRCRAFT DATA */}
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Aircraft Data</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>M/App CG (%)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={oasParams.missedAppCG} onChange={e => setOasParams({ ...oasParams, missedAppCG: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Aircraft CAT</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={oasParams.acCategory} onChange={e => setOasParams({ ...oasParams, acCategory: e.target.value })}>
                          <option value="A">CAT A</option>
                          <option value="B">CAT B</option>
                          <option value="C">CAT C</option>
                          <option value="D">CAT D</option>
                          <option value="E">CAT E</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Wing Semi Span (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px", backgroundColor: oasParams.isStandard ? theme.bgOff : theme.bg }} value={oasParams.wingSemiSpan} onChange={e => setOasParams({ ...oasParams, wingSemiSpan: +e.target.value })} disabled={oasParams.isStandard} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>GP Wheel/Ant (m)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px", backgroundColor: oasParams.isStandard ? theme.bgOff : theme.bg }} value={oasParams.antennaHeight} onChange={e => setOasParams({ ...oasParams, antennaHeight: +e.target.value })} disabled={oasParams.isStandard} />
                      </div>
                      <label style={{ flex: 0.8, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", paddingBottom: "8px", cursor: "pointer", color: theme.navy }}>
                        <input type="checkbox" checked={oasParams.isStandard} onChange={e => setOasParams({ ...oasParams, isStandard: e.target.checked })} style={{ cursor: "pointer" }} /> STD
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- APV BARO-VNAV CONFIGURATOR --- */}
              {family === "APV_BARO" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>APV Baro-VNAV Data</strong>
                    
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>VPA (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.vpaDeg} onChange={e => setApvBaroParams({ ...apvBaroParams, vpaDeg: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>RDH (m)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.rdh} onChange={e => setApvBaroParams({ ...apvBaroParams, rdh: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>MACG (%)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.maGradientPct} onChange={e => setApvBaroParams({ ...apvBaroParams, maGradientPct: +e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>FAP Height (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.heightFap} onChange={e => setApvBaroParams({ ...apvBaroParams, heightFap: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Delta H (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.deltaH} onChange={e => setApvBaroParams({ ...apvBaroParams, deltaH: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Aero Elev (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.aerodromeElevFt} onChange={e => setApvBaroParams({ ...apvBaroParams, aerodromeElevFt: +e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Acft Cat</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.acftCategory} onChange={e => setApvBaroParams({ ...apvBaroParams, acftCategory: e.target.value })}>
                          <option value="A">CAT A</option>
                          <option value="B">CAT B</option>
                          <option value="C">CAT C</option>
                          <option value="D">CAT D</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>FAF Dist (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.fafDist} onChange={e => setApvBaroParams({ ...apvBaroParams, fafDist: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>MAPt Dist (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.maptDist} onChange={e => setApvBaroParams({ ...apvBaroParams, maptDist: +e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- DYNAMIC RNAV FIELDS --- */}
              {family === "RNAV" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "14px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "10px", border: `1px solid ${theme.border}`, marginTop: "10px" }}>
                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Mode</label>
                      <select style={inputStyle} value={rnavMode} onChange={e => setRnavMode(e.target.value)}>
                        <option value="RNP APCH">RNP APCH</option>
                        <option value="Advanced RNP">Advanced RNP</option>
                      </select>
                    </div>
                    <div style={{ flex: 0.5 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Alt Unit</label>
                      <select style={inputStyle} value={altUnit} onChange={e => setAltUnit(e.target.value)}>
                        <option value="m">Meters</option>
                        <option value="ft">Feet</option>
                      </select>
                    </div>
                    <div style={{ flex: 0.5 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Acft Cat</label>
                      <select style={inputStyle} value={rnavParams.acft_cat} onChange={e => setRnavParams({ ...rnavParams, acft_cat: e.target.value })}>
                        <option value="A">CAT A</option>
                        <option value="B">CAT B</option>
                        <option value="C">CAT C</option>
                        <option value="D">CAT D</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <p style={{ fontSize: "11px", color: theme.textMuted, margin: "0", fontStyle: "italic" }}>
                      Tip: Uncheck points to skip drawing dependent segments.
                    </p>

                    {[
                      { key: 'if', title: 'Intermediate Fix (IF)', use: rnavParams.use_if, lat: rnavParams.if_lat, lon: rnavParams.if_lon },
                      { key: 'faf', title: 'Final Approach Fix (FAF)', use: rnavParams.use_faf, lat: rnavParams.faf_lat, lon: rnavParams.faf_lon, alt: rnavParams.faf_alt },
                      { key: 'mapt', title: 'Missed Approach Point (MAPt)', use: rnavParams.use_mapt, lat: rnavParams.mapt_lat, lon: rnavParams.mapt_lon, alt: rnavParams.mapt_alt },
                      { key: 'ma_end', title: 'Missed Approach End Point', use: rnavParams.use_ma_end, lat: rnavParams.ma_end_lat, lon: rnavParams.ma_end_lon }
                    ].map((pt) => {
                      const isActive = pt.use;
                      const isTargeting = selectingRnavPoint === pt.key.toUpperCase();
                      return (
                        <div key={pt.key} style={{ padding: "10px", backgroundColor: isActive ? theme.bg : theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${isActive ? theme.border : 'transparent'}`, transition: "all 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input type="checkbox" checked={isActive} onChange={e => setRnavParams({ ...rnavParams, [`use_${pt.key}`]: e.target.checked })} style={{ cursor: "pointer" }} />
                            <strong style={{ fontSize: "11px", color: isActive ? theme.navy : theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{pt.title}</strong>
                          </div>
                          {isActive && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                              <input type="number" placeholder="Lat" style={{ ...inputStyle, padding: "8px" }} value={pt.lat || ""} onChange={e => setRnavParams({ ...rnavParams, [`${pt.key}_lat`]: +e.target.value })} />
                              <input type="number" placeholder="Lon" style={{ ...inputStyle, padding: "8px" }} value={pt.lon || ""} onChange={e => setRnavParams({ ...rnavParams, [`${pt.key}_lon`]: +e.target.value })} />
                              {pt.alt !== undefined && (
                                <input type="number" placeholder="Alt" style={{ ...inputStyle, padding: "8px" }} value={pt.alt || ""} onChange={e => setRnavParams({ ...rnavParams, [`${pt.key}_alt`]: +e.target.value })} title={`Altitude in ${altUnit}`} />
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectingRnavPoint(isTargeting ? null : pt.key.toUpperCase() as any); }} 
                                style={{ padding: "0 10px", backgroundColor: isTargeting ? "#dc3545" : theme.navy, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background 0.2s" }} 
                                title="Pick from 3D Map">
                                {isTargeting ? "Cancel" : "📍"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", cursor: "pointer", color: theme.navy, fontWeight: "bold" }}>
                    <input type="checkbox" checked={useCustomRnav} onChange={e => setUseCustomRnav(e.target.checked)} style={{ cursor: "pointer" }} />
                    Manual Override (XTT / ATT / SW)
                  </label>

                  {useCustomRnav && (
                    <div style={{ border: `1px solid ${theme.border}`, padding: "12px", borderRadius: theme.radiusSm, backgroundColor: theme.bg }}>
                      <div style={{ display: "flex", gap: "5px", fontSize: "10px", fontWeight: "bold", marginBottom: "8px", color: theme.textMuted, textTransform: "uppercase" }}>
                        <span style={{ flex: 1 }}>Fix</span><span style={{ flex: 1 }}>XTT (NM)</span><span style={{ flex: 1 }}>ATT (NM)</span><span style={{ flex: 1 }}>SW (NM)</span>
                      </div>
                      {[
                        { key: "if", lbl: "IF" }, { key: "faf", lbl: "FAF" }, { key: "mapt", lbl: "MAPt" }
                      ].map(row => (
                        <div key={row.key} style={{ display: "flex", gap: "5px", marginBottom: "6px" }}>
                          <span style={{ flex: 1, fontSize: "11px", fontWeight: 600, color: theme.navy, alignSelf: "center" }}>{row.lbl}</span>
                          <input style={{ ...numInputStyle, padding: "6px" }} type="number" value={(rnavOverrides as any)[`${row.key}_xtt`]} onChange={e => setRnavOverrides({ ...rnavOverrides, [`${row.key}_xtt`]: +e.target.value })} />
                          <input style={{ ...numInputStyle, padding: "6px" }} type="number" value={(rnavOverrides as any)[`${row.key}_att`]} onChange={e => setRnavOverrides({ ...rnavOverrides, [`${row.key}_att`]: +e.target.value })} />
                          <input style={{ ...numInputStyle, padding: "6px" }} type="number" value={(rnavOverrides as any)[`${row.key}_sw`]} onChange={e => setRnavOverrides({ ...rnavOverrides, [`${row.key}_sw`]: +e.target.value })} />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px", borderTop: `1px solid ${theme.border}`, paddingTop: "10px", alignItems: "center" }}>
                        <span style={{ flex: 1, fontSize: "11px", fontWeight: 600, color: theme.navy }}>MAPt to SOC (NM)</span>
                        <input style={{ ...numInputStyle, padding: "8px", flex: 2 }} type="number" placeholder="Auto-calc via VTAS" value={rnavOverrides.mapt_soc} onChange={e => setRnavOverrides({ ...rnavOverrides, mapt_soc: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- VSS / OCS CONFIGURATOR --- */}
              {family === "VSS" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  <div style={{ display: "flex", gap: "8px", backgroundColor: "#fff8eb", padding: "12px", borderRadius: theme.radiusSm, border: "1px solid #f5d6b0" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: "#c05621", textTransform: "uppercase" }}>VPA (°)</label>
                      <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={vssParams.vpa} onChange={e => handleVpaOrTypeChange(+e.target.value, vssParams.appType)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: "#c05621", textTransform: "uppercase" }}>RDH (m)</label>
                      <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={vssParams.rdh} onChange={e => setVssParams({ ...vssParams, rdh: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: "#c05621", textTransform: "uppercase" }}>Approach Type</label>
                      <select style={{ ...inputStyle, padding: "8px" }} value={vssParams.appType} onChange={e => handleVpaOrTypeChange(vssParams.vpa, e.target.value)}>
                        <option value="NPA">NPA (VPA - 1°)</option>
                        <option value="APV_BARO">APV Baro (VPA - 0.5°)</option>
                        <option value="APV_GEO">APV Geo (VPA - 0.5°)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>VSS Half-W (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={vssParams.stripWidth} onChange={e => setVssParams({ ...vssParams, stripWidth: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>OCS Start HW (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={vssParams.ocsStartWidth} onChange={e => setVssParams({ ...vssParams, ocsStartWidth: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>OCS End Base (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={vssParams.ocsEndWidthBase} onChange={e => setVssParams({ ...vssParams, ocsEndWidthBase: +e.target.value })} title="120m standard" />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>VSS Angle (°)</label>
                        <input type="number" step="0.01" style={{ ...inputStyle, padding: "8px", backgroundColor: theme.lightBlue }} value={vssParams.vssAngle} onChange={e => setVssParams({ ...vssParams, vssAngle: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>OCS Angle (°)</label>
                        <input type="number" step="0.01" style={{ ...inputStyle, padding: "8px", backgroundColor: theme.lightBlue }} value={vssParams.ocsAngle} onChange={e => setVssParams({ ...vssParams, ocsAngle: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Offset Angle (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={vssParams.offsetAngle} onChange={e => setVssParams({ ...vssParams, offsetAngle: +e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "15px", backgroundColor: theme.bg, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", color: theme.navy, fontWeight: "bold", cursor: "pointer" }}>
                      <input type="checkbox" checked={vssParams.drawVSS} onChange={e => setVssParams({ ...vssParams, drawVSS: e.target.checked })} style={{ cursor: "pointer" }} /> Draw VSS
                    </label>
                    <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", color: theme.navy, fontWeight: "bold", cursor: "pointer" }}>
                      <input type="checkbox" checked={vssParams.drawOCS} onChange={e => setVssParams({ ...vssParams, drawOCS: e.target.checked })} style={{ cursor: "pointer" }} /> Draw OCS
                    </label>
                  </div>
                </div>
              )}

              {/* DYNAMIC NAVAID FIELDS */}
              {family === "NAVAID" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "12px", border: `1px solid ${theme.border}`, marginTop: "10px" }}>
                  <div>
                    <label style={{...labelStyle, marginTop: 0}}>Facility Type (EUR Doc 015)</label>
                    <select style={inputStyle} value={navType} onChange={e => setNavType(e.target.value)}>
                      <optgroup label="Omni-directional">
                        <option value="CVOR">CVOR (Conventional VOR)</option>
                        <option value="DVOR">DVOR (Doppler VOR)</option>
                        <option value="DF">DF (Direction Finder)</option>
                        <option value="DME">DME</option>
                        <option value="NDB">NDB</option>
                        <option value="GBAS_GRR">GBAS GRR</option>
                        <option value="GBAS_VDB">GBAS VDB</option>
                        <option value="VDB_MS">VDB MS</option>
                      </optgroup>
                      <optgroup label="Directional">
                        <option value="ILS_LLZ_SF">ILS LLZ (Single Frequency)</option>
                        <option value="ILS_LLZ_DF">ILS LLZ (Dual Frequency)</option>
                        <option value="ILS_GP">ILS Glide Path (GP)</option>
                        <option value="MLS_AZ">MLS Azimuth</option>
                        <option value="MLS_EL">MLS Elevation</option>
                        <option value="DME_DIR">DME (Directional)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>Antenna Coordinates (Lat/Lon/Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setNavCoord, navCoord)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={navCoord.lat} onChange={e => setNavCoord({ ...navCoord, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={navCoord.lon} onChange={e => setNavCoord({ ...navCoord, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={navCoord.alt} onChange={e => setNavCoord({ ...navCoord, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  {isDirectional && (
                    <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                      <label style={{...labelStyle, marginTop: 0}}>Operational Bearing (°)</label>
                      <input style={{...inputStyle, marginBottom: "10px"}} type="number" value={navBearing} onChange={e => setNavBearing(+e.target.value)} />
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Reference Threshold (Lat/Lon/Alt)</label>
                        <button 
                          style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                          onClick={() => getCenterFromMap(setNavThr, navThr)}>
                          📍 Map
                        </button>
                      </div>
                      <div style={rowStyle}>
                        <input style={numInputStyle} type="number" value={navThr.lat} onChange={e => setNavThr({ ...navThr, lat: +e.target.value })} placeholder="Lat" />
                        <input style={numInputStyle} type="number" value={navThr.lon} onChange={e => setNavThr({ ...navThr, lon: +e.target.value })} placeholder="Lon" />
                        <input style={numInputStyle} type="number" value={navThr.alt} onChange={e => setNavThr({ ...navThr, alt: +e.target.value })} placeholder="Alt" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- HOLDING & REVERSAL CONFIGURATOR --- */}
              {family === "HOLDING" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Procedure Definition</strong>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Fix / Station (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT1, t1)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({ ...t1, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({ ...t1, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({ ...t1, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Procedure Type</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={holdingParams.type} onChange={e => setHoldingParams({ ...holdingParams, type: e.target.value })}>
                          <option value="HOLDING">Holding Pattern</option>
                          <option value="RACETRACK">Racetrack</option>
                          <option value="BASE_TURN">Base Turn</option>
                          <option value="PROC_TURN_45">45°/180° Proc Turn</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Inbound Brg (°)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.inbound_brg} onChange={e => setHoldingParams({ ...holdingParams, inbound_brg: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Turn Dir</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={holdingParams.turn_dir} onChange={e => setHoldingParams({ ...holdingParams, turn_dir: e.target.value })}>
                          <option value="R">Right</option>
                          <option value="L">Left</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Flight Parameters</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>IAS (kt)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.ias} onChange={e => setHoldingParams({ ...holdingParams, ias: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Altitude (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.alt_ft} onChange={e => setHoldingParams({ ...holdingParams, alt_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Time (min)</label>
                        <input type="number" step="0.5" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.time_min} onChange={e => setHoldingParams({ ...holdingParams, time_min: +e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>AD Elev (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.ad_elev_ft} onChange={e => setHoldingParams({ ...holdingParams, ad_elev_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Temp Ref (°C)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.temp_ref_c} onChange={e => setHoldingParams({ ...holdingParams, temp_ref_c: +e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PANS-OPS WIND SPIRAL CONFIGURATOR --- */}
              {family === "WIND_SPIRAL" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Turn Origin (Start)</strong>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Start Point (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT1, t1)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({ ...t1, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({ ...t1, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({ ...t1, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Inbound Bearing (°)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.inbound_bearing} onChange={e => setWsParams({ ...wsParams, inbound_bearing: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Turn Direction</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={wsParams.turn_direction} onChange={e => setWsParams({ ...wsParams, turn_direction: e.target.value })}>
                          <option value="R">Right (R)</option>
                          <option value="L">Left (L)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Aircraft & Flight Dynamics</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>IAS (kt)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.ias} onChange={e => setWsParams({ ...wsParams, ias: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Altitude (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.altitude_ft} onChange={e => setWsParams({ ...wsParams, altitude_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Bank Angle (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={wsParams.bank_angle} onChange={e => setWsParams({ ...wsParams, bank_angle: +e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Wind Speed (kt)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.wind_speed} onChange={e => setWsParams({ ...wsParams, wind_speed: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>AD Elev (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.ad_elev_ft} onChange={e => setWsParams({ ...wsParams, ad_elev_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Temp Ref (°C)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.temp_ref_c} onChange={e => setWsParams({ ...wsParams, temp_ref_c: +e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC OFZ FIELDS */}
              {family === "OFZ" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "8px", border: `1px solid ${theme.border}`, marginTop: "10px" }}>
                  <label style={{...labelStyle, marginTop: 0}}>Aeroplane Design Group (ADG)</label>
                  <select style={inputStyle} value={adg} onChange={e => setAdg(e.target.value)}>
                    <option value="I">I (Wingspan &lt; 24m)</option>
                    <option value="IIA">IIA (Wingspan 24m - 36m)</option>
                    <option value="IIB">IIB (Wingspan &lt; 36m, Faster App)</option>
                    <option value="IIC">IIC (Wingspan &lt; 36m, High Speed)</option>
                    <option value="III">III (Wingspan 36m - 52m)</option>
                    <option value="IV">IV (Wingspan 52m - 65m)</option>
                    <option value="V">V (Wingspan 65m - 80m)</option>
                  </select>
                </div>
              )}

              {family === "CUSTOM" && (
                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px", opacity: user?.is_premium ? 1 : 0.6, padding: "16px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  <label style={{ ...labelStyle, color: "#d4af37", marginTop: 0 }}>★ Premium Feature: Geometry Import</label>
                  <p style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 8px 0", lineHeight: 1.4 }}>Upload KML, DXF, GeoJSON, or AIXM files.</p>
                  <input
                    type="file"
                    accept=".csv,.txt,.kml,.dxf,.geojson,.json,.aixm,.xml"
                    onChange={handleFileUpload}
                    style={{ ...inputStyle, padding: "8px", fontSize: "13px" }}
                    disabled={!user?.is_premium}
                  />
                  <label style={{ ...labelStyle, marginTop: "10px" }}>Coordinates Data</label>
                  <textarea
                    style={{ ...inputStyle, height: "120px", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.4", resize: "vertical" }}
                    placeholder={`Format: Name, Lat1, Lon1, Alt1, Lat2, Lon2, Alt2...\nExample:\nBuilding_A, 51.47, -0.45, 100, 51.48, -0.44, 105, 51.46, -0.44, 100`}
                    value={customPoints}
                    onChange={e => setCustomPoints(e.target.value)}
                    disabled={!user?.is_premium}
                  />
                  {!user?.is_premium && <p style={{ color: "#e74c3c", fontSize: "12px", margin: 0, fontWeight: "bold" }}>Upgrade to Premium to define Custom Surfaces.</p>}
                </div>
              )}

              <button
                onClick={handleDefine}
                style={{ ...createBtnStyle, opacity: isCreating ? 0.7 : 1, cursor: isCreating ? "wait" : "pointer" }}
                disabled={isCreating}
              >
                {isCreating ? "⏳ Processing..." : `Create ${family} Surface`}
              </button>
            </div>
          )}

          {/* --- ANALYZE TAB --- */}
          {activeTab === "analyze" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* --- GOOGLE 3D TILES TOGGLE --- */}
                {(currentOwnerToken || (user?.is_premium && user?.ion_token)) && (
                  <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", color: theme.text, cursor: "pointer", padding: "0 4px", fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={showGoogleTiles} 
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setShowGoogleTiles(isChecked);
                        if (isChecked) {
                            const tokenToUse = currentOwnerToken || user?.ion_token || DEFAULT_ION_TOKEN;
                            Cesium.Ion.defaultAccessToken = tokenToUse;
                        }
                      }} 
                      style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: theme.navy }}
                    />
                    Enable Google Photorealistic 3D Tiles
                  </label>
                )}

                {/* 1. PUBLIC PREMIUM SURFACES SEARCH */}
                <div style={{ backgroundColor: theme.bgOff, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <label style={{...labelStyle, marginTop: 0, color: theme.navy, display: "flex", alignItems: "center", gap: "6px"}}>
                    <span style={{ fontSize: "14px" }}>🔍</span> Search Public Surfaces
                  </label>
                  <input 
                    style={{...inputStyle, padding: "5px 12px", fontSize: "14px"}} 
                    value={pubSurfQuery}
                    onChange={e => handleSearchPublicSurfaces(e.target.value)}
                    onFocus={e => { if (pubSurfResults.length === 0) handleSearchPublicSurfaces(e.target.value); }}
                    onBlur={() => { setTimeout(() => setPubSurfResults([]), 200); }}
                    placeholder="Type airport name or ICAO..."
                  />
                  {/* SEARCH RESULTS AUTOCOMPLETE */}
                  {pubSurfResults.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: theme.bg, border: `1px solid ${theme.border}`, zIndex: 100, maxHeight: "220px", overflowY: "auto", boxShadow: theme.shadowHover, borderRadius: theme.radiusSm, marginTop: "4px" }}>
                      {pubSurfResults.map((s: any, idx) => (
                        <div key={idx} onClick={async () => {
                            setSelectedAnalysisAirport(s.airport_name); setSelectedAnalysisOwner(s.owner_id); setPubSurfQuery(s.airport_name); setPubSurfResults([]); 
                            try {
                              const res = await fetch(`${API_BASE}/airports/${s.owner_id}/${encodeURIComponent(s.airport_name)}`);
                              if (res.ok) {
                                const data = await res.json();
                                if (data.ion_token) { Cesium.Ion.defaultAccessToken = data.ion_token; setCurrentOwnerToken(data.ion_token); } 
                                else { Cesium.Ion.defaultAccessToken = DEFAULT_ION_TOKEN; setCurrentOwnerToken(null); }
                                if (showBuildings && viewerRef.current) {
                                  if (buildingsRef.current) { viewerRef.current.scene.primitives.remove(buildingsRef.current); buildingsRef.current = null; }
                                  try { const buildings = await Cesium.createOsmBuildingsAsync(); viewerRef.current.scene.primitives.add(buildings); buildingsRef.current = buildings; } catch (err) {}
                                }
                                let newOffset = geoidOffset;
                                if (data.surfaces.length > 0 && data.surfaces[0].geometry.length > 0) {
                                  const firstCoord = getFirstCoord(data.surfaces[0].geometry);
                                  if (firstCoord) newOffset = await autoFetchGeoidOffset(firstCoord[1], firstCoord[0]);
                                }
                                handleDrawSurface(data.surfaces, newOffset);
                              }
                            } catch (err) {}
                          }}
                          style={{ padding: "12px", borderBottom: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "13px", color: theme.text, transition: "background 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.lightBlue}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <strong>{s.airport_name}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. MY SURFACES DROPDOWN */}
                <div style={{ padding: "0 4px" }}>
                  <label style={labelStyle}>Or Select Personal Workspace</label>
                  <select 
                    style={{...inputStyle, cursor: "pointer"}} 
                    value={savedSurfaces.some(s => s.airport_name === selectedAnalysisAirport) ? selectedAnalysisAirport : ""} 
                    onChange={async e => {
                      const chosenAirport = e.target.value; setSelectedAnalysisAirport(chosenAirport); setSelectedAnalysisOwner(user?.id || 0); setPubSurfQuery(""); 
                      if (chosenAirport) {
                        const airportSurfaces = savedSurfaces.filter(s => s.airport_name === chosenAirport);
                        let newOffset = geoidOffset;
                        if (airportSurfaces.length > 0 && airportSurfaces[0].geometry.length > 0) {
                          const firstCoord = getFirstCoord(airportSurfaces[0].geometry);
                          if (firstCoord) newOffset = await autoFetchGeoidOffset(firstCoord[1], firstCoord[0]);
                        }
                        handleDrawSurface(airportSurfaces, newOffset);
                      } else { if (viewerRef.current) viewerRef.current.entities.removeAll(); }
                    }}
                  >
                    <option value="">Select your airport...</option>
                    {Array.from(new Set(savedSurfaces.map(s => s.airport_name))).map(airport => (
                      <option key={airport} value={airport}>{airport}</option>
                    ))}
                  </select>
                </div>
                
                {/* 3. SINGLE OBSTACLE ANALYSIS */}
                <div style={{ padding: "0 4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={labelStyle}>Target Obstacle (Lat/Lon/Alt)</label>
                    <span style={{ fontSize: "10px", color: theme.textMuted, fontStyle: "italic", fontWeight: 600 }}>🖱️ Click map to pick</span>
                  </div>
                  <div style={rowStyle}>
                    <input style={numInputStyle} type="number" value={obsPos.lat} onChange={e => setObsPos({...obsPos, lat: +e.target.value})} placeholder="Lat" />
                    <input style={numInputStyle} type="number" value={obsPos.lon} onChange={e => setObsPos({...obsPos, lon: +e.target.value})} placeholder="Lon" />
                    <input style={numInputStyle} type="number" value={obsPos.alt} onChange={e => setObsPos({...obsPos, alt: +e.target.value})} placeholder="Alt (m)" />
                  </div>
                </div>

                <button 
                  style={{ ...createBtnStyle, marginTop: "0px", opacity: isAnalyzing ? 0.7 : 1, cursor: isAnalyzing ? "wait" : "pointer" }}
                  disabled={isAnalyzing}
                  onClick={async () => {
                    if (!selectedAnalysisAirport) return showToast("Please select an airport first!", "error");
                    setIsAnalyzing(true); setAnalysisResult(null);
                    try {
                      const isGuestAirport = selectedAnalysisOwner === 0;
                      const guestPayload = isGuestAirport ? savedSurfaces.filter(s => s.airport_name === selectedAnalysisAirport).map(s => ({name: s.name, geometry: s.geometry})) : null;
                      const res = await fetch(`${API_BASE}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: obsPos.lat, lon: obsPos.lon, alt: obsPos.alt, airport_name: selectedAnalysisAirport, owner_id: selectedAnalysisOwner, guest_surfaces: guestPayload }) });
                      const result = await res.json();
                      if (result.error) return showToast(result.error, "error");
                      setAnalysisResult(result);
                    } catch (err) { showToast("Analysis failed.", "error"); } 
                    finally { setIsAnalyzing(false); }
                  }}
                >
                  {isAnalyzing ? "⚙️ Processing..." : "Run Analysis"}
                </button>

                {/* --- ANALYSIS RESULTS UI & PDF EXPORT --- */}
                {analysisResult && (
                  <div style={{ backgroundColor: analysisResult.penetration ? "#fff5f5" : "#f0fdf4", padding: "16px", borderRadius: theme.radiusSm, border: `1px solid ${analysisResult.penetration ? "#fed7d7" : "#bbf7d0"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <h4 style={{ margin: "0 0 12px 0", color: analysisResult.penetration ? "#c53030" : "#15803d", fontSize: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                      {analysisResult.penetration ? "❌ VIOLATION DETECTED" : "✅ OBSTACLE CLEAR"}
                    </h4>
                    <div style={{ fontSize: "12px", color: theme.text, lineHeight: 1.6, marginBottom: "16px" }}>
                      <p style={{ margin: 0 }}><strong>Limiting Surface:</strong> {analysisResult.limiting_surface}</p>
                      <p style={{ margin: 0 }}><strong>Margin:</strong> {analysisResult.margin} m</p>
                    </div>
                    <button 
                      style={{ width: "100%", padding: "12px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s", fontSize: "13px" }} 
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.navyHover}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                      onClick={generatePDF}
                    >
                      ⤓ Download Official Report (PDF)
                    </button>
                  </div>
                )}

                {/* --- PREMIUM: BATCH UPLOAD --- */}
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, opacity: user?.is_premium ? 1 : 0.6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{...labelStyle, color: "#d4af37", margin: 0}}>★ Batch Obstacle Upload</label>
                      <input type="file" accept=".csv,.txt,.geojson,.json,.aixm,.xml,.kml" onChange={handleBatchFileUpload} disabled={!user?.is_premium} style={{ fontSize: "11px", maxWidth: "120px" }} />
                  </div>
                  <p style={{fontSize: "11px", color: theme.textMuted, margin: "0 0 10px 0", lineHeight: 1.4}}>Upload GeoJSON, AIXM, KML or CSV to analyse multiple targets instantly.</p>
                  
                  <textarea 
                    style={{ ...inputStyle, height: "100px", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.4", resize: "vertical" }} 
                    placeholder={`Crane_1, 51.47, -0.45, 120\nBuilding_A, 51.472, -0.44, 95\n...`}
                    value={batchInput} onChange={e => setBatchInput(e.target.value)} disabled={!user?.is_premium}
                  />
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                    <button 
                      style={{ width: "100%", padding: "12px", backgroundColor: user?.is_premium ? theme.blue : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} 
                      disabled={!user?.is_premium || isAnalyzingBatch} 
                      onClick={handleBatchAnalyze}
                    >
                      {isAnalyzingBatch ? "⏳ Processing Batch..." : "Run Batch Analysis"}
                    </button>
                    
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        style={{ flex: 1, padding: "10px", backgroundColor: user?.is_premium && batchResults.length > 0 ? theme.navy : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium && batchResults.length > 0 ? "pointer" : "not-allowed", transition: "background 0.2s" }} 
                        disabled={!user?.is_premium || batchResults.length === 0} 
                        onClick={downloadBatchCSV}
                      >
                        ⤓ .CSV Results
                      </button>
                      <button 
                        style={{ flex: 1, padding: "10px", backgroundColor: user?.is_premium && batchResults.length > 0 ? "#b91c1c" : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium && batchResults.length > 0 ? "pointer" : "not-allowed", transition: "background 0.2s" }} 
                        disabled={!user?.is_premium || batchResults.length === 0} 
                        onClick={generateBatchPDF}
                      >
                        ⤓ PDF Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- PREMIUM EXPORT PANEL --- */}
                {selectedAnalysisAirport && (
                  <div style={{ backgroundColor: "#fefcbf", padding: "16px", borderRadius: theme.radiusSm, border: "1px solid #fbd38d" }}>
                    <label style={{...labelStyle, color: "#975a16", margin: "0 0 10px 0"}}>★ Premium Export Tools</label>
                    <p style={{fontSize: "11px", color: "#975a16", margin: "0 0 12px 0", lineHeight: 1.4}}>Download this generated airspace into your native GIS tools.</p>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? theme.navy : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('kml')}>⭳ .KML</button>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? theme.navy : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('dxf')}>⭳ .DXF</button>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? "#15803d" : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('geojson')}>⭳ GeoJSON</button>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? "#b91c1c" : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('aixm')}>⭳ AIXM 5.1</button>
                    </div>
                    
                    {!user?.is_premium && (
                      <p style={{ color: "#c53030", fontSize: "11px", marginTop: "10px", textAlign: "center", fontWeight: "bold" }}>
                        Log in to a Premium account to unlock 3D exports.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- DASHBOARD TAB --- */}
          {activeTab === "dashboard" && (() => {
              const uniqueAirportsCount = new Set(savedSurfaces.map(s => s.airport_name)).size;
              const maxAirports = user ? user.max_airports : 0; 
              
              return (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
                  <label style={{...labelStyle, margin: 0, fontSize: "14px", color: theme.navy}}>Saved Airspaces</label>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: user?.is_premium ? theme.navy : theme.textMuted, backgroundColor: theme.bgOff, padding: "4px 8px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                    Storage: {uniqueAirportsCount} / {maxAirports}
                  </span>
                </div>

                {user?.is_premium && uniqueAirportsCount > 0 && (
                  <div style={{ backgroundColor: theme.lightBlue, padding: "16px", borderRadius: theme.radiusSm, border: "1px solid #cce5ff", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                    <label style={{...labelStyle, margin: 0, color: theme.navy, marginBottom: "12px"}}>⚙️ Manage Visibility</label>
                    <select style={{...inputStyle, cursor: "pointer"}} value={manageAptSelect} onChange={e => {
                        const apt = e.target.value; setManageAptSelect(apt); setManageAptName(apt);
                        const surf = savedSurfaces.find(s => s.airport_name === apt); setManageAptPublic(surf?.is_public ?? true);
                      }}>
                      <option value="">Select an airport to edit...</option>
                      {Array.from(new Set(savedSurfaces.map(s => s.airport_name))).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    {manageAptSelect && (
                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px dashed #b3d9f7", paddingTop: "12px" }}>
                        <input style={inputStyle} value={manageAptName} onChange={e => setManageAptName(e.target.value)} placeholder="Rename Airport" />
                        <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", color: theme.text, cursor: "pointer", fontWeight: 600 }}>
                          <input type="checkbox" checked={manageAptPublic} onChange={e => setManageAptPublic(e.target.checked)} style={{cursor:"pointer", width: "16px", height: "16px", accentColor: theme.navy}}/>
                          Public (Visible in CAA Verified Search)
                        </label>
                        <button 
                          style={{ padding: "12px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.navyHover}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                          onClick={async () => {
                            if (!manageAptName) return showToast("Name cannot be empty.", "error");
                            const res = await fetch(`${API_BASE}/airports/${encodeURIComponent(manageAptSelect)}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({ new_name: manageAptName, is_public: manageAptPublic }) });
                            if (res.ok) {
                              showToast("Airport updated successfully!", "success");
                              setSavedSurfaces(prev => prev.map(s => s.airport_name === manageAptSelect ? { ...s, airport_name: manageAptName, is_public: manageAptPublic } : s ));
                              setManageAptSelect(manageAptName); 
                            } else { const err = await res.json(); showToast(`Error: ${err.detail || "Failed to update"}`, "error"); }
                          }}> Save Changes </button>
                      </div>
                    )}
                  </div>
                )}

                {!user ? (
                  <div style={{ backgroundColor: "#fff5f5", border: "1px solid #fed7d7", padding: "20px", borderRadius: theme.radiusSm, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <p style={{ fontSize: "13px", color: "#c53030", margin: 0, fontWeight: 600 }}>Please log in to manage your saved surfaces.</p>
                  </div>
                ) : savedSurfaces.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", border: `2px dashed ${theme.border}`, borderRadius: theme.radiusSm, backgroundColor: theme.bgOff }}>
                    <span style={{fontSize: "24px", display: "block", marginBottom: "10px", color: "#cbd5e1"}}>📂</span>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, fontWeight: 500 }}>You haven't saved any surfaces yet. Go to the Define tab to create one!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "55vh", overflowY: "auto", paddingRight: "4px" }}>
                    {savedSurfaces.map(s => (
                      <div key={s.id} style={{ padding: "16px", backgroundColor: theme.bgOff, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <strong style={{ fontSize: "14px", color: theme.navy, lineHeight: 1.3 }}>
                            {s.airport_name ? `${s.airport_name} - ` : ""}{s.name}
                          </strong>
                          <span style={{ fontSize: "10px", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, padding: "4px 8px", borderRadius: "12px", color: theme.textMuted, fontWeight: 700, letterSpacing: "0.5px" }}>
                            {s.family}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 12px 0", fontStyle: "italic" }}>
                          Contains {s.geometry.length} 3D geometric meshes.
                        </div>
                        <div style={{...rowStyle, borderTop: `1px solid ${theme.border}`, paddingTop: "12px"}}>
                          <button style={{ flex: 1, padding: "10px", backgroundColor: theme.blue, color: "white", border: "none", borderRadius: theme.radiusSm, fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blueHover}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.blue}
                            onClick={async () => {
                              let newOffset = geoidOffset; if (s.geometry && s.geometry.length > 0) { const firstCoord = getFirstCoord(s.geometry); if (firstCoord) newOffset = await autoFetchGeoidOffset(firstCoord[1], firstCoord[0]); } handleDrawSurface([s], newOffset);
                            }}> 🗺️ Draw </button>
                          <button style={{ flex: 1, padding: "10px", backgroundColor: "#64748b", color: "white", border: "none", borderRadius: theme.radiusSm, fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#475569"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#64748b"}
                            onClick={() => setExpandedSurfaceId(expandedSurfaceId === s.id ? null : s.id)}>
                            {expandedSurfaceId === s.id ? "▲ Close" : "▼ Layers"}
                          </button>
                          <button style={{ flex: 0.4, padding: "10px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: theme.radiusSm, fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dc2626"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ef4444"}
                            onClick={() => handleDeleteSurface(s.id)}> 🗑️ </button>
                        </div>
                        {expandedSurfaceId === s.id && (
                            <div style={{ marginTop: "12px", padding: "12px", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm }}>
                                <small style={{ fontWeight: "bold", color: theme.textMuted, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}>Individual Layers:</small>
                                <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
                                    {s.geometry.map((geo: any, idx: number) => (
                                        <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: idx === s.geometry.length - 1 ? "none" : `1px solid ${theme.border}`, padding: "8px 0", fontSize: "12px" }}>
                                            <span style={{ color: theme.text, fontWeight: 500 }}>{geo.name}</span>
                                            <button onClick={() => handleDeleteComponent(s.id, geo.name)} style={{ border: "none", background: "none", color: "#dc3545", cursor: "pointer", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fee2e2"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"} title="Delete layer"> ✖ </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {!user?.is_premium && uniqueAirportsCount >= 1 && (
                  <div style={{ backgroundColor: "#fefcbf", padding: "12px", borderRadius: theme.radiusSm, border: "1px solid #fbd38d", marginTop: "10px" }}>
                    <p style={{ color: "#975a16", fontSize: "12px", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                      <strong>Free Tier Limit Reached.</strong><br/>
                      Upgrade to Premium to save up to 10 distinct airport configurations.
                    </p>
                  </div>
                )}
                
                {user?.is_premium && (
                  <div style={{ backgroundColor: theme.lightBlue, padding: "16px", borderRadius: theme.radiusSm, border: "1px solid #cce5ff", marginTop: "16px" }}>
                    <label style={{...labelStyle, margin: 0, color: theme.navy, marginBottom: "6px"}}>🗄️ Official Authorization Logs</label>
                    <p style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 16px 0", lineHeight: 1.4 }}>
                      Download a complete CSV record of all official evaluation PDFs generated for your airspaces.
                    </p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: theme.navy, display: "block", marginBottom: "6px" }}>Start Date</label>
                        <input type="date" style={{ ...inputStyle, padding: "10px", fontSize: "13px" }} value={logStartDate} onChange={e => setLogStartDate(e.target.value)} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: theme.navy, display: "block", marginBottom: "6px" }}>End Date</label>
                        <input type="date" style={{ ...inputStyle, padding: "10px", fontSize: "13px" }} value={logEndDate} onChange={e => setLogEndDate(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={handleDownloadLogs} style={{ width: "100%", padding: "12px", backgroundColor: "#15803d", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", fontSize: "13px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#166534"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#15803d"}>
                      ⤓ Download CSV History
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* --- EXAGGERATION WIDGET --- */}
        <div style={{
          position: "absolute", bottom: "10px", right: "30px", backgroundColor: "rgba(255, 255, 255, 0.96)", backdropFilter: "blur(10px)",
          padding: "14px 18px", borderRadius: theme.radius, boxShadow: theme.shadowHover, border: `1px solid ${theme.border}`, zIndex: 10, display: "flex", flexDirection: "column", gap: "10px", width: "240px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: theme.navy, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>3D Exaggeration</label>
            <span style={{ fontSize: "15px", color: theme.blue, fontWeight: 800 }}>{exaggeration}x</span>
          </div>
          <input type="range" min="1" max="10" step="0.5" defaultValue={1} 
            onChange={(e) => {
                const val = parseFloat(e.target.value); 
                setExaggeration(val);
                exagRef.current = val;
                
                if (viewerRef.current) viewerRef.current.scene.verticalExaggeration = val;
            }}
            onMouseUp={() => { if (drawnSurfacesRef.current.length > 0) handleDrawSurface(drawnSurfacesRef.current, geoidOffset); }}
            style={{ width: "100%", cursor: "pointer", accentColor: theme.blue }}
          />
        </div>

        {/* --- ACCOUNT / LOGIN PANEL (Floating Box) --- */}
        <div style={{
          // THE FIX: Increased zIndex to 99 so it floats above Quick Tools, 
          // and positioned it relative to the bottom right corner
          position: "absolute", bottom: "100px", right: "20px", zIndex: 99, 
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px"
        }}>
          {/* TOGGLE BUTTON */}
          <button
            onClick={() => setShowAccountPanel(!showAccountPanel)}
            style={{
              width: "50px", height: "50px", borderRadius: "50%", 
              // THE FIX: Pure white background with Navy border/icon so it is highly visible
              backgroundColor: "white", color: theme.navy, 
              border: `2px solid ${theme.navy}`, boxShadow: theme.shadowHover,
              cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", 
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.lightBlue; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}
            title={showAccountPanel ? "Minimize Panel" : "Show Account Panel"}
          >
            {showAccountPanel ? "✕" : (user ? "👤" : "🔑")}
          </button>

          {/* PANEL CONTENT */}
          {showAccountPanel && (
            <div style={{
              width: "340px", backgroundColor: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(10px)",
              padding: "24px", borderRadius: theme.radius, boxShadow: theme.shadowHover, border: `1px solid ${theme.border}`
            }}>
              {!user ? (
                isResending ? (
                  // RESEND VERIFICATION
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <strong style={{ fontSize: "18px", color: theme.navy, fontWeight: 800 }}>Resend Verification</strong>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>Enter your email to receive a new activation link.</p>
                    <input style={inputStyle} type="email" value={resendEmailInput} onChange={e => setResendEmailInput(e.target.value)} placeholder="Registered Email Address" />
                    <button style={{ width: "100%", padding: "12px", backgroundColor: "#0891b2", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0e7490"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0891b2"}
                      onClick={async () => {
                        if (!resendEmailInput) return showToast("Please enter your email", "error");
                        const res = await fetch(`${API_BASE}/resend-verification`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: resendEmailInput }) });
                        const data = await res.json(); showToast(data.message, "info"); setIsResending(false);
                      }}> Send New Link </button>
                    <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", marginTop: "4px", fontWeight: 600, textDecoration: "underline" }} onClick={() => setIsResending(false)}> Back to Login </button>
                  </div>
                ) : isForgotPassword ? (
                  // FORGOT PASSWORD
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <strong style={{ fontSize: "18px", color: theme.navy, fontWeight: 800 }}>Reset Password</strong>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>Enter your account email to receive a reset link.</p>
                    <input style={inputStyle} type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Registered Email Address" />
                    <button style={{ width: "100%", padding: "12px", backgroundColor: theme.blue, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blueHover} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.blue}
                      onClick={async () => {
                        if (!forgotEmail) return showToast("Please enter your email", "error");
                        await fetch(`${API_BASE}/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) });
                        showToast("If that email exists in our system, a reset link has been sent.", "info"); setIsForgotPassword(false);
                      }}> Send Reset Link </button>
                    <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", marginTop: "4px", fontWeight: 600, textDecoration: "underline" }} onClick={() => setIsForgotPassword(false)}> Back to Login </button>
                  </div>
                ) : (
                  // LOGIN/REGISTER
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "18px", color: theme.navy, fontWeight: 800 }}>{isRegistering ? "Register Account" : "Guest Mode"}</strong>
                      {!isRegistering && <span style={{ fontSize: "11px", backgroundColor: theme.border, padding: "4px 10px", borderRadius: "12px", fontWeight: 700, color: theme.textMuted }}>Free Tier</span>}
                    </div>
                    {!isRegistering && <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>Create 1 surface temporarily as a guest, or log in for premium features.</p>}
                    <hr style={{ margin: "4px 0", borderTop: `1px solid ${theme.border}` }} />
                    {isRegistering && <input style={inputStyle} type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="Email Address" />}
                    <input style={inputStyle} value={loginInput} onChange={e => setLoginInput(e.target.value)} placeholder="Username" />
                    <input type="password" style={inputStyle} value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" />
                    <button disabled={isLoggingIn}
                      style={{ width: "100%", padding: "14px", backgroundColor: isRegistering ? "#15803d" : theme.blue, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: isLoggingIn ? "wait" : "pointer", opacity: isLoggingIn ? 0.7 : 1, marginTop: "6px", fontSize: "14px", transition: "background 0.2s" }} 
                      onClick={handleAuth}
                      onMouseEnter={e => {if (!isLoggingIn) e.currentTarget.style.backgroundColor = isRegistering ? "#166534" : theme.blueHover}}
                      onMouseLeave={e => {if (!isLoggingIn) e.currentTarget.style.backgroundColor = isRegistering ? "#15803d" : theme.blue}}
                    > {isLoggingIn ? "⏳ Processing..." : (isRegistering ? "Sign Up" : "Log In")} </button>
                    <button style={{ background: "none", border: "none", color: theme.blue, fontSize: "13px", cursor: "pointer", marginTop: "6px", fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.navy} onMouseLeave={e => e.currentTarget.style.color = theme.blue} onClick={() => setIsRegistering(!isRegistering)}>
                      {isRegistering ? "Already have an account? Log in." : "Create a FREE PREMIUM account"}
                    </button>
                    {!isRegistering && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", borderTop: `1px solid ${theme.border}`, paddingTop: "16px" }}>
                      <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }} onClick={() => setIsForgotPassword(true)}> Forgot Password? </button>
                      <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }} onClick={() => setIsResending(true)}> Resend Verification </button>
                    </div>
                    )}
                  </div>
                )
              ) : (
                // LOGGED IN VIEW
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "16px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: theme.navy }}>
                      👤 {user.username} {user.is_premium && <span style={{ color: "#d97706", fontSize: "14px", marginLeft: "6px" }}>★ Premium</span>}
                    </span>
                    <button onClick={handleLogout} style={{ fontSize: "12px", padding: "8px 12px", cursor: "pointer", backgroundColor: theme.bgOff, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, fontWeight: 700, color: theme.textMuted, transition: "all 0.2s" }} onMouseEnter={e => {e.currentTarget.style.backgroundColor = "#e2e8f0"; e.currentTarget.style.color = theme.text}} onMouseLeave={e => {e.currentTarget.style.backgroundColor = theme.bgOff; e.currentTarget.style.color = theme.textMuted}}>Logout</button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <label style={{...labelStyle, margin: 0, fontSize: "14px"}}>⚙️ Account Settings</label>
                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} style={{ fontSize: "12px", padding: "6px 10px", cursor: "pointer", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "4px", fontWeight: 600, color: theme.blue }}>
                      {isEditingProfile ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <input style={inputStyle} value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="New Username" />
                      <input style={inputStyle} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email Address" />
                      <input style={inputStyle} type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="New Password" />
                      
                      <button onClick={handleUpdateProfile} style={{ width: "100%", padding: "12px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", marginTop: "8px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}>
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "14px", color: theme.text, lineHeight: 1.8, backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                      <p style={{ margin: "0 0 8px 0" }}><strong style={{color: theme.textMuted}}>Username:</strong> {user.username}</p>
                      <p style={{ margin: "0 0 8px 0" }}><strong style={{color: theme.textMuted}}>Email:</strong> {user.email || <span style={{color: "#999"}}>Not provided</span>}</p>
                      <p style={{ margin: "0" }}><strong style={{color: theme.textMuted}}>Account Type:</strong> {user.is_premium ? "Premium Authority" : "Free User"}</p>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}
            </div>
      </div>{/* end inner scaled canvas */}
    </main>
  );
}