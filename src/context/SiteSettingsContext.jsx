import { createContext, useContext, useState, useEffect } from "react";
import API, { clearApiCache } from "../services/api";

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme_mode: "user-controlled",
    enable_smooth_scroll: true,
    enable_page_loader: true,
    enable_typing_animation: true,
    enable_cursor_effect: true,
    enable_section_animations: true,
    navbar_sticky_mode: true,
    navbar_black_background: true,
    show_navbar_theme_toggle: true,
    show_social_links: true,
    show_hero_primary_cta: true,
    show_hero_secondary_cta: false,
    enable_contact_form: true,
    favicon_url: "/favicon.svg",
    // ACCORDION DETAILS (to keep backward compatibility)
    frame_material: "",
    lens_technology: "",
    warranty: "",
    origin: "",
    includes: "",
    shipping_standard_title: "",
    shipping_standard_desc: "",
    shipping_express_title: "",
    shipping_express_desc: "",
    returns_title: "",
    returns_desc: "",
    appointment_title: "",
    appointment_desc: "",
    appointment_how: "",
    contact_phone: "",
    contact_hours: "",
    contact_email: "",
    contact_response: "",
    enable_image_hover: true,
    hero_slide_interval: 8,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async (options = {}) => {
    try {
      if (options.skipCache) {
        clearApiCache();
      }
      const res = await API.get("/settings", { skipCache: !!options.skipCache });
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch site settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, setSettings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
};
