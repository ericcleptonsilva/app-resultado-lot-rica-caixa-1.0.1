import React from "react";

const styles = {
  adBannerFixed: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    backgroundColor: "#f7f7f7",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
  },
  adBannerInline: {
    width: "100%",
    maxWidth: "100%",
    height: "100px", // Altura padrão banner mobile grande
    backgroundColor: "#f0f0f0",
    border: "1px dashed #ccc",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    margin: "20px 0",
    overflow: "hidden",
  },
  adLabel: {
    fontSize: "10px",
    color: "#999",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "4px",
  },
  adContent: {
    color: "#bbb",
    fontWeight: "bold" as const,
    fontSize: "14px",
  }
};

const AdBanner = ({ fixed = false }: { fixed?: boolean }) => {
  return (
    <div style={fixed ? styles.adBannerFixed : styles.adBannerInline}>
      <span style={styles.adLabel}>Publicidade</span>
      <div style={styles.adContent}>
        {fixed ? "Espaço Banner 320x50" : "Espaço Anúncio Responsivo"}
      </div>
    </div>
  );
};

export default AdBanner;
