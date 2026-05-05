// @ts-nocheck
"use client";

export default function QuickTools(props: any) {
  const {
    activeTab,
    activeTabBtn,
    activeTool,
    addPbnLeg,
    adg,
    airportName,
    altUnit,
    analysisResult,
    API_BASE,
    apvBaroParams,
    apvParams,
    arcCode,
    arpAlt,
    autoFetchGeoidOffset,
    batchInput,
    batchResults,
    buildingsRef,
    cesiumContainer,
    clearTools,
    cOls,
    createBtnStyle,
    currentOwnerToken,
    customPoints,
    DEFAULT_ION_TOKEN,
    DESIGN_W,
    downloadBatchCSV,
    drawnSurfacesRef,
    editEmail,
    editIonToken,
    editPassword,
    editUsername,
    exaggeration,
    exagRef,
    expandedSurfaceId,
    family,
    forgotEmail,
    generateBatchPDF,
    generatePDF,
    genericColor,
    geoidOffset,
    getAuthHeaders,
    getCenterFromMap,
    getFirstCoord,
    getTrueMslAltitude,
    googleTilesRef,
    handleAuth,
    handleBatchAnalyze,
    handleBatchFileUpload,
    handleDefine,
    handleDeleteComponent,
    handleDeleteSurface,
    handleDownloadLogs,
    handleDrawSurface,
    handleExport,
    handleFileUpload,
    handleHeliPresetChange,
    handleLogout,
    handleSearch,
    handleSearchPublicSurfaces,
    handleSelectNavaid,
    handleSelectRunway,
    handleUpdateProfile,
    handleVpaOrTypeChange,
    heliParams,
    heliPreset,
    holdingParams,
    inactiveTabBtn,
    inputStyle,
    isAnalyzing,
    isAnalyzingBatch,
    isCreating,
    isDirectional,
    isEditingProfile,
    isForgotPassword,
    isGenericMode,
    isLoggingIn,
    isRegistering,
    isResending,
    isSearching,
    isSidebarOpen,
    isXRayMode,
    labelStyle,
    logEndDate,
    loginInput,
    logStartDate,
    manageAptName,
    manageAptPublic,
    manageAptSelect,
    measureResult,
    mounted,
    navBearing,
    navCoord,
    navThr,
    navType,
    newPassword,
    numInputStyle,
    oasParams,
    obsPos,
    passwordInput,
    pbnParams,
    pointResult,
    pubSurfQuery,
    pubSurfResults,
    registerEmail,
    removePbnLeg,
    resendEmailInput,
    resetToken,
    rnavMode,
    rnavOverrides,
    rnavParams,
    rowStyle,
    rulerPts,
    runwayType,
    savedSurfaces,
    scaledH,
    searchQuery,
    searchResults,
    selectedAnalysisAirport,
    selectedAnalysisOwner,
    selectingPbnArc,
    selectingPbnLeg,
    selectingRnavPoint,
    setActiveTab,
    setActiveTool,
    setAdg,
    setAirportName,
    setAltUnit,
    setAnalysisResult,
    setApvBaroParams,
    setApvParams,
    setArcCode,
    setArpAlt,
    setBatchInput,
    setBatchResults,
    setCOls,
    setCurrentOwnerToken,
    setCustomPoints,
    setEditEmail,
    setEditIonToken,
    setEditPassword,
    setEditUsername,
    setExaggeration,
    setExpandedSurfaceId,
    setFamily,
    setForgotEmail,
    setGeoidOffset,
    setHeliParams,
    setHeliPreset,
    setHoldingParams,
    setIsAnalyzing,
    setIsAnalyzingBatch,
    setIsCreating,
    setIsEditingProfile,
    setIsForgotPassword,
    setIsGenericMode,
    setIsLoggingIn,
    setIsRegistering,
    setIsResending,
    setIsSearching,
    setIsSidebarOpen,
    setIsXRayMode,
    setLogEndDate,
    setLoginInput,
    setLogStartDate,
    setManageAptName,
    setManageAptPublic,
    setManageAptSelect,
    setMeasureResult,
    setMounted,
    setNavBearing,
    setNavCoord,
    setNavThr,
    setNavType,
    setNewPassword,
    setOasParams,
    setObsPos,
    setPasswordInput,
    setPbnParams,
    setPointResult,
    setPubSurfQuery,
    setPubSurfResults,
    setRegisterEmail,
    setResendEmailInput,
    setResetToken,
    setRnavMode,
    setRnavOverrides,
    setRnavParams,
    setRulerPts,
    setRunwayType,
    setSavedSurfaces,
    setScaledH,
    setSearchQuery,
    setSearchResults,
    setSelectedAnalysisAirport,
    setSelectedAnalysisOwner,
    setSelectingPbnArc,
    setSelectingPbnLeg,
    setSelectingRnavPoint,
    setShowAccountPanel,
    setShowBuildings,
    setShowGoogleTiles,
    setShowTools,
    setSurfName,
    setT1,
    setT2,
    setToast,
    setToolTip,
    setUseCustomRnav,
    setUser,
    setVertiportParams,
    setVpScale,
    setVssParams,
    setWsParams,
    showAccountPanel,
    showBuildings,
    showGoogleTiles,
    showToast,
    showTools,
    sidebarStyle,
    surfName,
    t1,
    t2,
    theme,
    toast,
    toolsDataSourceRef,
    toolTip,
    updatePbnLeg,
    useCustomRnav,
    user,
    vertiportParams,
    viewerRef,
    vpScale,
    vssParams,
    wsParams,
  } = props;

  return (
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
  );
}
