import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API, { clearApiCache } from "../services/api";
import ThemeToggle from "../components/Common/ThemeToggle";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { 
  Plus, Edit, Trash2, Copy, Search, Eye, Filter, 
  Upload, Link2, X, AlertTriangle, CheckCircle, ArrowRight,
  ExternalLink, LayoutDashboard, Folder, Tag, FileText, LogOut
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { admin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { refreshSettings } = useSiteSettings();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0, totalOrders: 0, totalUsers: 0 });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [toast, setToast] = useState(null);

  // Lists Filters & Pagination
  const [prodSearch, setProdSearch] = useState("");
  const [prodCatFilter, setProdCatFilter] = useState("");
  const [prodStatusFilter, setProdStatusFilter] = useState("");

  // Modals state
  const [productModal, setProductModal] = useState({ open: false, isEdit: false, data: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, isEdit: false, data: null });
  const [bannerModal, setBannerModal] = useState({ open: false, isEdit: false, data: null });

  // About Section CMS State
  const [aboutForm, setAboutForm] = useState({
    label: "",
    heading_line_1: "",
    heading_line_2: "",
    highlighted_word: "",
    description: "",
    button_text: "",
    button_url: "",
    image_url: "",
    image_public_id: "",
    status: "draft"
  });
  const [aboutSaving, setAboutSaving] = useState(false);
  const [isAboutDirty, setIsAboutDirty] = useState(false);

  // Lookbook CMS State
  const [lookbookData, setLookbookData] = useState({
    mens: {
      title: "Men's Opticals",
      image_url: "https://i.pinimg.com/1200x/ef/bf/7f/efbf7f315360dfeb44b5837f937a5fe.jpg",
      images: [
        "https://i.pinimg.com/1200x/ef/bf/7f/efbf7f315360dfeb44b5837f937a5fe.jpg",
        "https://i.pinimg.com/1200x/b1/48/0b/b1480b502149be9afc8769b976086b24.jpg",
        "https://i.pinimg.com/736x/16/e3/c8/16e3c803108b8b4f8a29347376d1ff18.jpg",
        "https://i.pinimg.com/1200x/f2/7a/d0/f27ad0e1535c849592443b189441a239.jpg"
      ]
    },
    womens: {
      title: "Women's Opticals",
      image_url: "https://i.pinimg.com/736x/21/6b/c4/216bc4440041891f2c1829749206590e.jpg",
      images: [
        "https://i.pinimg.com/736x/21/6b/c4/216bc4440041891f2c1829749206590e.jpg",
        "https://i.pinimg.com/1200x/dd/1d/64/dd1d648053c844d679ab23349818f7c6.jpg",
        "https://i.pinimg.com/1200x/ba/d6/d8/bad6d85eb2ee5bdf24f3dead62767225.jpg",
        "https://res.cloudinary.com/ddluoarzr/image/upload/f_auto,q_auto/v1784856533/c1e3097c27038e2dffbe9f518e227289_fy23o6.jpg"
      ]
    }
  });
  const [lookbookSaving, setLookbookSaving] = useState(false);
  const [isLookbookDirty, setIsLookbookDirty] = useState(false);

  // Campaign CMS State
  const [campaignForm, setCampaignForm] = useState({
    video_url: "/assets/h4.mkv",
    slides: [
      { tag: "", heading: "", paragraph: "" },
      { tag: "", heading: "", paragraph: "" },
      { tag: "", heading: "", paragraph: "" }
    ]
  });
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [isCampaignDirty, setIsCampaignDirty] = useState(false);

  // Page Settings CMS State
  const [settingsForm, setSettingsForm] = useState({
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
    favicon_url: "",
    favicon_public_id: "",
    theme_mode: "user-controlled",
    enable_smooth_scroll: true,
    enable_page_loader: true,
    enable_typing_animation: true,
    enable_cursor_effect: true,
    enable_section_animations: true,
    navbar_sticky_mode: true,
    show_navbar_theme_toggle: true,
    show_social_links: true,
    show_hero_primary_cta: true,
    show_hero_secondary_cta: true,
    enable_contact_form: true,
    footer_newsletter_title: "",
    footer_email: "",
    footer_social_instagram: "",
    footer_social_pinterest: "",
    footer_copyright: "",
    footer_tagline: "",
    footer_contact_title: "",
    footer_connect_title: "",
    footer_content_title: "",
    footer_legal_title: ""
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate("/login");
    }
  }, [admin, authLoading, navigate]);

  // Load dashboard general data
  useEffect(() => {
    if (admin) {
      fetchStats();
      fetchProducts();
      fetchCategories();
      fetchBanners();
      fetchAboutData();
      fetchLookbookData();
      fetchCampaignData();
      fetchSettingsData();
    }
  }, [admin]);

  // Unsaved changes auto-save & unload protection
  useEffect(() => {
    if (isAboutDirty && activeTab === "about") {
      localStorage.setItem("about_draft", JSON.stringify(aboutForm));
    }
  }, [aboutForm, isAboutDirty, activeTab]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isAboutDirty || isLookbookDirty || isCampaignDirty || isSettingsDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAboutDirty, isLookbookDirty, isCampaignDirty, isSettingsDirty]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAboutData = async () => {
    try {
      const res = await API.get("/about");
      if (res.data) {
        setAboutForm(res.data);
        const savedDraft = localStorage.getItem("about_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (JSON.stringify(parsed) !== JSON.stringify(res.data)) {
            if (window.confirm("You have unsaved changes in your local draft from a previous session. Would you like to restore them?")) {
              setAboutForm(parsed);
              setIsAboutDirty(true);
            } else {
              localStorage.removeItem("about_draft");
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to load about section data:", err);
    }
  };

  const handleDescriptionChange = (val) => {
    if (val.length <= 1000) {
      setAboutForm({ ...aboutForm, description: val });
      setIsAboutDirty(true);
    }
  };

  const handleSaveAbout = async () => {
    if (!aboutForm.label || !aboutForm.heading_line_1 || !aboutForm.heading_line_2 || !aboutForm.highlighted_word || !aboutForm.description) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setAboutSaving(true);
      await API.put("/about", aboutForm);
      showToast("About Section content updated successfully");
      setIsAboutDirty(false);
      localStorage.removeItem("about_draft");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update About Section content", "error");
    } finally {
      setAboutSaving(false);
    }
  };

  const defaultMenImages = [
    "https://i.pinimg.com/1200x/ef/bf/7f/efbf7f315360dfeb44b5837f937a5fe.jpg",
    "https://i.pinimg.com/1200x/b1/48/0b/b1480b502149be9afc8769b976086b24.jpg",
    "https://i.pinimg.com/736x/16/e3/c8/16e3c803108b8b4f8a29347376d1ff18.jpg",
    "https://i.pinimg.com/1200x/f2/7a/d0/f27ad0e1535c849592443b189441a239.jpg"
  ];

  const defaultWomenImages = [
    "https://res.cloudinary.com/ddluoarzr/image/upload/f_auto,q_auto/v1784856533/c1e3097c27038e2dffbe9f518e227289_fy23o6.jpg",
    "https://i.pinimg.com/736x/21/6b/c4/216bc4440041891f2c1829749206590e.jpg",
    "https://i.pinimg.com/1200x/dd/1d/64/dd1d648053c844d679ab23349818f7c6.jpg",
    "https://i.pinimg.com/1200x/ba/d6/d8/bad6d85eb2ee5bdf24f3dead62767225.jpg"
  ];

  const fetchLookbookData = async () => {
    try {
      const res = await API.get("/lookbook");
      if (res.data && res.data.length > 0) {
        const mensItem = res.data.find(item => item.look_key === "mens") || {};
        const womensItem = res.data.find(item => item.look_key === "womens") || {};
        
        const mensImgs = (Array.isArray(mensItem.images) && mensItem.images.length > 0)
          ? mensItem.images
          : (mensItem.image_url ? [mensItem.image_url] : defaultMenImages);

        const womensImgs = (Array.isArray(womensItem.images) && womensItem.images.length > 0)
          ? womensItem.images
          : (womensItem.image_url ? [womensItem.image_url] : defaultWomenImages);

        setLookbookData({
          mens: {
            title: mensItem.title || "Men's Opticals",
            image_url: mensImgs[0] || defaultMenImages[0],
            images: [
              mensImgs[0] || defaultMenImages[0],
              mensImgs[1] || defaultMenImages[1],
              mensImgs[2] || defaultMenImages[2],
              mensImgs[3] || defaultMenImages[3]
            ],
            image_public_id: mensItem.image_public_id || ""
          },
          womens: {
            title: womensItem.title || "Women's Opticals",
            image_url: womensImgs[0] || defaultWomenImages[0],
            images: [
              womensImgs[0] || defaultWomenImages[0],
              womensImgs[1] || defaultWomenImages[1],
              womensImgs[2] || defaultWomenImages[2],
              womensImgs[3] || defaultWomenImages[3]
            ],
            image_public_id: womensItem.image_public_id || ""
          }
        });
      }
    } catch (err) {
      console.error("Failed to load lookbook section data:", err);
    }
  };

  const handleSaveLookbook = async () => {
    const mensImgs = (lookbookData.mens.images || []).filter(Boolean);
    const womensImgs = (lookbookData.womens.images || []).filter(Boolean);

    if (!lookbookData.mens.title || mensImgs.length === 0 || !lookbookData.womens.title || womensImgs.length === 0) {
      showToast("Please fill in card title and at least 1 image for both lookbooks", "error");
      return;
    }

    try {
      setLookbookSaving(true);
      await Promise.all([
        API.put("/lookbook/mens", {
          title: lookbookData.mens.title,
          image_url: mensImgs[0],
          images: mensImgs,
          image_public_id: lookbookData.mens.image_public_id || ""
        }),
        API.put("/lookbook/womens", {
          title: lookbookData.womens.title,
          image_url: womensImgs[0],
          images: womensImgs,
          image_public_id: lookbookData.womens.image_public_id || ""
        })
      ]);

      showToast("Lookbook content & 3s auto-slider images updated successfully");
      setIsLookbookDirty(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update lookbook content", "error");
    } finally {
      setLookbookSaving(false);
    }
  };

  const fetchCampaignData = async () => {
    try {
      const res = await API.get("/campaign");
      if (res.data) {
        setCampaignForm(res.data);
      }
    } catch (err) {
      console.error("Failed to load campaign section data:", err);
    }
  };

  const handleSaveCampaign = async () => {
    // Validate slides fields
    for (let i = 0; i < campaignForm.slides.length; i++) {
      const slide = campaignForm.slides[i];
      if (!slide.tag || !slide.heading || !slide.paragraph) {
        showToast(`Please fill in all fields for Slide #${i + 1}`, "error");
        return;
      }
    }

    try {
      setCampaignSaving(true);
      await API.put("/campaign", campaignForm);
      showToast("Campaign Section content updated successfully");
      setIsCampaignDirty(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update Campaign Section content", "error");
    } finally {
      setCampaignSaving(false);
    }
  };

  const fetchSettingsData = async () => {
    try {
      const res = await API.get("/settings");
      if (res.data) {
        setSettingsForm(res.data);
      }
    } catch (err) {
      console.error("Failed to load product page settings data:", err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsSaving(true);
      await API.put("/settings", settingsForm);
      clearApiCache();
      await refreshSettings({ skipCache: true });
      showToast("Product Page Settings updated successfully");
      setIsSettingsDirty(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update Product Page Settings", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products list:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories list:", err);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await API.get("/dashboard/hero");
      setBanners(res.data);
    } catch (err) {
      console.error("Failed to load banners list:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // --- PRODUCT CRUD HANDLERS ---
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? All its variants and variant images will be permanently deleted.")) return;
    try {
      await API.delete(`/products/${id}`);
      showToast("Product deleted successfully");
      fetchProducts();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete product", "error");
    }
  };

  const handleDuplicateProduct = async (id) => {
    try {
      const res = await API.post(`/products/duplicate/${id}`);
      showToast("Product duplicated successfully as draft");
      fetchProducts();
      fetchStats();
      // Open editor on the duplicated product
      const dupId = res.data.duplicateProductId;
      const detail = await API.get(`/products/${dupId}`);
      setProductModal({ open: true, isEdit: true, data: detail.data });
    } catch (err) {
      showToast("Failed to duplicate product", "error");
    }
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      showToast("Category deleted successfully");
      fetchCategories();
      fetchStats();
    } catch (err) {
      showToast("Failed to delete category", "error");
    }
  };

  // --- BANNER CRUD HANDLERS ---
  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await API.delete(`/dashboard/hero/${id}`);
      showToast("Banner deleted successfully");
      fetchBanners();
    } catch (err) {
      showToast("Failed to delete banner", "error");
    }
  };

  // Filters calculation
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                          p.sku.toLowerCase().includes(prodSearch.toLowerCase()) || 
                          (p.tags && p.tags.toLowerCase().includes(prodSearch.toLowerCase()));
    const matchesCategory = prodCatFilter ? String(p.category_id) === String(prodCatFilter) : true;
    const matchesStatus = prodStatusFilter ? p.status === prodStatusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (authLoading || !admin) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0c0c0c", color: "#fff", letterSpacing: "2px", fontSize: "0.8rem" }}>
        VERIFYING SESSION...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-dot"></span>
          <h2>CROMIC CMS</h2>
        </div>
        
        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === "overview" ? "active" : ""}`} 
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === "products" ? "active" : ""}`} 
            onClick={() => setActiveTab("products")}
          >
            <Folder size={18} />
            <span>Products</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === "categories" ? "active" : ""}`} 
            onClick={() => setActiveTab("categories")}
          >
            <Tag size={18} />
            <span>Categories</span>
          </button>
          
          <button 
            className={`menu-item ${["banners", "about", "lookbook", "campaign", "settings"].includes(activeTab) ? "active" : ""}`} 
            onClick={() => setActiveTab("banners")}
          >
            <FileText size={18} />
            <span>Page Content</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="admin-main">
        <header className="main-header">
          <div className="breadcrumbs">
            <span>Admin</span>
            <span className="divider">/</span>
            <span className="current-path">
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "products" && "Products"}
              {activeTab === "categories" && "Categories"}
              {["banners", "about", "lookbook", "campaign", "settings"].includes(activeTab) && "Page Content"}
            </span>
          </div>
          
          <div className="header-actions">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="view-site-btn"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}
            >
              <ExternalLink size={13} />
              <span>View Website</span>
            </a>
            <ThemeToggle />
            <div className="user-profile">
              <span>Hello, <strong className="user-name">{admin.username}</strong></span>
            </div>
          </div>
        </header>
        
        <div className="admin-container-inner">
          {/* Sub-tabs for Page Content */}
          {["banners", "about", "lookbook", "campaign", "settings"].includes(activeTab) && (
            <div className="page-content-header-block">
              <div className="page-content-title-row">
                <h2>Page Content Editor</h2>
                <p>Easily update your website text grids, hero sections, lookbook layouts, and dynamic configurations.</p>
              </div>
              
              <div className="page-content-subtabs">
                <button 
                  className={`subtab-btn ${activeTab === "banners" ? "active" : ""}`} 
                  onClick={() => setActiveTab("banners")}
                >
                  HERO BANNERS
                </button>
                <button 
                  className={`subtab-btn ${activeTab === "about" ? "active" : ""}`} 
                  onClick={() => setActiveTab("about")}
                >
                  ABOUT SECTION
                </button>
                <button 
                  className={`subtab-btn ${activeTab === "lookbook" ? "active" : ""}`} 
                  onClick={() => setActiveTab("lookbook")}
                >
                  LOOKBOOK SECTION
                </button>
                <button 
                  className={`subtab-btn ${activeTab === "campaign" ? "active" : ""}`} 
                  onClick={() => setActiveTab("campaign")}
                >
                  CAMPAIGN SECTION
                </button>
                <button 
                  className={`subtab-btn ${activeTab === "settings" ? "active" : ""}`} 
                  onClick={() => setActiveTab("settings")}
                >
                  GENERAL SETTINGS
                </button>
              </div>
            </div>
          )}

        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Products</h3>
                <div className="number">{stats.totalProducts}</div>
              </div>
              <div className="stat-card">
                <h3>Total Categories</h3>
                <div className="number">{stats.totalCategories}</div>
              </div>
              <div className="stat-card">
                <h3>Orders CMS</h3>
                <div className="number">{stats.totalOrders}</div>
                <span className="future-label">Future Ready</span>
              </div>
              <div className="stat-card">
                <h3>Registered Admins</h3>
                <div className="number">{stats.totalUsers}</div>
                <span className="future-label">Future Ready</span>
              </div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "2rem", borderRadius: "4px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 300, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "1rem" }}>System Architecture Status</h2>
              <p style={{ fontSize: "0.85rem", opacity: 0.7, lineHeight: 1.6, maxWidth: "700px", marginBottom: "1.5rem" }}>
                Your Cromic Eyewear store is currently integrated with a Node.js Express backend, MongoDB Atlas database, and Cloudinary storage.
                All product variations, homepage editorial showcases, and media carousel displays are served dynamically.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="add-new-btn" style={{ fontSize: "0.7rem" }} onClick={() => setActiveTab("products")}>Manage Products &rarr;</button>
                <button className="cancel-btn" style={{ fontSize: "0.7rem", padding: "0.6rem 1.2rem" }} onClick={() => setActiveTab("banners")}>Edit Banner Media &rarr;</button>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === "products" && (
          <div>
            <div className="content-header">
              <h2>Product Directory ({filteredProducts.length})</h2>
              <button className="add-new-btn" onClick={() => setProductModal({ open: true, isEdit: false, data: null })}>
                + Add Product
              </button>
            </div>

            {/* Filter Bar */}
            <div className="filters-bar">
              <div className="search-input-wrapper" style={{ flexGrow: 1, display: "flex", alignItems: "center", position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "10px", opacity: 0.5 }} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search by SKU, Product name, tags..." 
                  value={prodSearch} 
                  onChange={(e) => setProdSearch(e.target.value)}
                  style={{ paddingLeft: "35px", width: "100%" }}
                />
              </div>
              
              <select className="filter-select" value={prodCatFilter} onChange={(e) => setProdCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select className="filter-select" value={prodStatusFilter} onChange={(e) => setProdStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Products Table */}
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>No products found matching the criteria.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="product-row-info">
                            <img src={p.image || "https://images.unsplash.com/photo-1511599767150-a48a237f0083?w=100"} className="product-row-img" alt={p.name} />
                            <div>
                              <div style={{ fontWeight: 500 }}>{p.name}</div>
                              <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>{p.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.sku}</td>
                        <td>{p.category || "Uncategorized"}</td>
                        <td>{p.price}</td>
                        <td>{p.stock} units</td>
                        <td>
                          <span className={`status-badge ${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="action-icon-btn" title="View details" onClick={() => window.open(`/product/${p.id}`, "_blank")}>
                              <Eye size={14} />
                            </button>
                            <button className="action-icon-btn" title="Edit product" onClick={async () => {
                              try {
                                const detail = await API.get(`/products/${p.id}`);
                                setProductModal({ open: true, isEdit: true, data: detail.data });
                              } catch (err) {
                                showToast("Failed to fetch product variations details", "error");
                              }
                            }}>
                              <Edit size={14} />
                            </button>
                            <button className="action-icon-btn" title="Duplicate product" onClick={() => handleDuplicateProduct(p.id)}>
                              <Copy size={14} />
                            </button>
                            <button className="action-icon-btn delete" title="Delete product" onClick={() => handleDeleteProduct(p.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CATEGORIES TAB --- */}
        {activeTab === "categories" && (
          <div>
            <div className="content-header">
              <h2>Category / Collection Directory ({categories.length})</h2>
              <button className="add-new-btn" onClick={() => setCategoryModal({ open: true, isEdit: false, data: null })}>
                + Add Category
              </button>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                          {c.image && <img src={c.image} className="product-row-img" alt={c.name} style={{ borderRadius: "50%" }} />}
                          <strong style={{ textTransform: "uppercase", letterSpacing: "1px" }}>{c.name}</strong>
                        </div>
                      </td>
                      <td><code>{c.slug}</code></td>
                      <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description || "-"}</td>
                      <td>
                        <span className={`status-badge ${c.status === "active" ? "published" : "draft"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="action-icon-btn" onClick={() => setCategoryModal({ open: true, isEdit: true, data: c })}>
                            <Edit size={14} />
                          </button>
                          <button className="action-icon-btn delete" onClick={() => handleDeleteCategory(c.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- HERO BANNERS TAB --- */}
        {activeTab === "banners" && (
          <div>
            <div className="content-header">
              <h2>Homepage Hero Banners ({banners.length})</h2>
              <button className="add-new-btn" onClick={() => setBannerModal({ open: true, isEdit: false, data: null })}>
                + Add Banner
              </button>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Display Content</th>
                    <th>Media Type</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div>
                          <strong style={{ fontSize: "0.95rem" }}>{b.title}</strong>
                          <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "0.2rem" }}>{b.subtitle}</div>
                        </div>
                      </td>
                      <td>
                        {b.hero_video ? (
                          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", padding: "0.2rem 0.5rem" }}>VIDEO</span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", padding: "0.2rem 0.5rem" }}>IMAGE</span>
                        )}
                      </td>
                      <td>{b.banner_order}</td>
                      <td>
                        <span className={`status-badge ${b.active_status ? "published" : "draft"}`}>
                          {b.active_status ? "active" : "disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="action-icon-btn" onClick={() => setBannerModal({ open: true, isEdit: true, data: b })}>
                            <Edit size={14} />
                          </button>
                          <button className="action-icon-btn delete" onClick={() => handleDeleteBanner(b.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ABOUT SECTION TAB --- */}
        {activeTab === "about" && (
          <div>
            <div className="content-header">
              <h2>About Page Section CMS</h2>
              <div style={{ display: "flex", gap: "1rem" }}>
                {isAboutDirty && <span style={{ fontSize: "0.75rem", color: "orange", display: "flex", alignItems: "center" }}>⚠️ Unsaved Draft</span>}
                <button 
                  className="add-new-btn" 
                  onClick={handleSaveAbout}
                  disabled={aboutSaving}
                >
                  {aboutSaving ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveAbout(); }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Section Small Label *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={aboutForm.label} 
                    onChange={(e) => { setAboutForm({ ...aboutForm, label: e.target.value }); setIsAboutDirty(true); }} 
                    placeholder="e.g. OUR STORY"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Heading Line 1 *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={aboutForm.heading_line_1} 
                    onChange={(e) => { setAboutForm({ ...aboutForm, heading_line_1: e.target.value }); setIsAboutDirty(true); }} 
                    placeholder="e.g. Crafted"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Heading Line 2 *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={aboutForm.heading_line_2} 
                    onChange={(e) => { setAboutForm({ ...aboutForm, heading_line_2: e.target.value }); setIsAboutDirty(true); }} 
                    placeholder="e.g. Beyond"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Highlighted Word *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={aboutForm.highlighted_word} 
                    onChange={(e) => { setAboutForm({ ...aboutForm, highlighted_word: e.target.value }); setIsAboutDirty(true); }} 
                    placeholder="e.g. Vision"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Button Display Text</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={aboutForm.button_text} 
                    onChange={(e) => { setAboutForm({ ...aboutForm, button_text: e.target.value }); setIsAboutDirty(true); }} 
                    placeholder="e.g. Explore Brand"
                  />
                </div>

                <div className="form-group">
                  <label>Button Destination URL</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={aboutForm.button_url} 
                    onChange={(e) => { setAboutForm({ ...aboutForm, button_url: e.target.value }); setIsAboutDirty(true); }} 
                    placeholder="e.g. /shop"
                  />
                </div>

                <div className="form-group">
                  <label>Publish Status</label>
                  <select 
                    className="form-select" 
                    value={aboutForm.status} 
                    onChange={(e) => { setAboutForm({ ...aboutForm, status: e.target.value }); setIsAboutDirty(true); }}
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Hidden, falls back to default on storefront)</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description Paragraph * ({aboutForm.description ? aboutForm.description.length : 0} / 1000 characters)</label>
                  <textarea 
                    className="form-input form-textarea" 
                    rows="4" 
                    value={aboutForm.description} 
                    onChange={(e) => handleDescriptionChange(e.target.value)} 
                    placeholder="Provide a detailed description of the section content..."
                    required 
                  />
                </div>

                <div className="form-group full-width">
                  <SingleImageManager 
                    value={aboutForm.image_url} 
                    onChange={(url) => { setAboutForm({ ...aboutForm, image_url: url }); setIsAboutDirty(true); }} 
                    label="About Section Image Showcase" 
                    type="image"
                    showToast={showToast} 
                  />
                </div>
              </div>
            </form>

            {/* Simulated Live Preview */}
            <div style={{ marginTop: "3rem", borderTop: "1px solid var(--borders)", paddingTop: "2rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 300, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "1.5rem" }}>Live Screen Preview</h3>
              
              <div className="story-section" style={{ border: "1px solid var(--borders)", padding: "3rem", background: "var(--background)", borderRadius: "4px", minHeight: "400px" }}>
                <div className="story-top" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "2rem" }}>
                  <div className="story-left">
                    <span className="story-label" style={{ display: "block", fontSize: "0.75rem", letterSpacing: "2.5px", color: "var(--secondary-text)", marginBottom: "0.8rem", textTransform: "uppercase", fontWeight: 500 }}>
                      {aboutForm.label || "OUR STORY"}
                    </span>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: 300, textTransform: "uppercase", lineHeight: 1.2 }}>
                      {aboutForm.heading_line_1 || "Crafted"} <br />
                      {aboutForm.heading_line_2 || "Beyond"} <span style={{ color: "var(--primary-text)", fontWeight: 600, borderBottom: "1px solid", paddingBottom: "2px" }}>{aboutForm.highlighted_word || "Vision"}</span>
                    </h2>
                  </div>
                  <div className="story-right">
                    <p style={{ fontSize: "0.9rem", opacity: 0.7, lineHeight: 1.7, marginBottom: "1.5rem" }}>
                      {aboutForm.description || "Description paragraph..."}
                    </p>
                    <button style={{ background: "var(--primary-text)", color: "var(--background)", padding: "0.8rem 1.8rem", fontSize: "0.75rem", fontWeight: 600, border: "1px solid var(--primary-text)", letterSpacing: "1px", textTransform: "uppercase", cursor: "default" }}>
                      {aboutForm.button_text || "Explore Brand"}
                    </button>
                  </div>
                </div>
                <div className="story-image" style={{ width: "100%", height: "300px", overflow: "hidden", background: "var(--hover)" }}>
                  <img 
                    src={aboutForm.image_url || "https://images.pexels.com/photos/30271002/pexels-photo-30271002.jpeg"} 
                    alt="Preview" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LOOKBOOK SECTION TAB --- */}
        {activeTab === "lookbook" && (
          <div>
            <div className="content-header">
              <h2>Lookbook Showcase CMS</h2>
              <div style={{ display: "flex", gap: "1rem" }}>
                {isLookbookDirty && <span style={{ fontSize: "0.75rem", color: "orange", display: "flex", alignItems: "center" }}>⚠️ Unsaved Changes</span>}
                <button 
                  className="add-new-btn" 
                  onClick={handleSaveLookbook}
                  disabled={lookbookSaving}
                >
                  {lookbookSaving ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", width: "100%", boxSizing: "border-box" }}>
              {/* Men's Lookbook Card */}
              <div className="cms-card-container">
                <h3 className="cms-card-title">MEN'S LOOKBOOK</h3>
                
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.5px" }}>Card Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={lookbookData.mens.title} 
                    onChange={(e) => {
                      setLookbookData({
                        ...lookbookData,
                        mens: { ...lookbookData.mens, title: e.target.value }
                      });
                      setIsLookbookDirty(true);
                    }} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "0.8rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--admin-primary)" }}>
                    4-Image Auto Slider (3s Interval)
                  </label>
                  {[0, 1, 2, 3].map((slotIdx) => (
                    <div key={`mens-img-${slotIdx}`} style={{ marginBottom: "1.2rem" }}>
                      <SingleImageManager 
                        value={lookbookData.mens.images?.[slotIdx] || ""} 
                        onChange={(url) => {
                          const newImgs = [...(lookbookData.mens.images || ["", "", "", ""])];
                          newImgs[slotIdx] = url;
                          setLookbookData({
                            ...lookbookData,
                            mens: {
                              ...lookbookData.mens,
                              images: newImgs,
                              image_url: newImgs[0] || url
                            }
                          });
                          setIsLookbookDirty(true);
                        }} 
                        label={`Showcase Image ${slotIdx + 1} ${slotIdx === 0 ? "(Primary)" : ""}`} 
                        type="image"
                        showToast={showToast} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Women's Lookbook Card */}
              <div className="cms-card-container">
                <h3 className="cms-card-title">WOMEN'S LOOKBOOK</h3>
                
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.5px" }}>Card Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={lookbookData.womens.title} 
                    onChange={(e) => {
                      setLookbookData({
                        ...lookbookData,
                        womens: { ...lookbookData.womens, title: e.target.value }
                      });
                      setIsLookbookDirty(true);
                    }} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "0.8rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--admin-primary)" }}>
                    4-Image Auto Slider (3s Interval)
                  </label>
                  {[0, 1, 2, 3].map((slotIdx) => (
                    <div key={`womens-img-${slotIdx}`} style={{ marginBottom: "1.2rem" }}>
                      <SingleImageManager 
                        value={lookbookData.womens.images?.[slotIdx] || ""} 
                        onChange={(url) => {
                          const newImgs = [...(lookbookData.womens.images || ["", "", "", ""])];
                          newImgs[slotIdx] = url;
                          setLookbookData({
                            ...lookbookData,
                            womens: {
                              ...lookbookData.womens,
                              images: newImgs,
                              image_url: newImgs[0] || url
                            }
                          });
                          setIsLookbookDirty(true);
                        }} 
                        label={`Showcase Image ${slotIdx + 1} ${slotIdx === 0 ? "(Primary)" : ""}`} 
                        type="image"
                        showToast={showToast} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Display */}
            <div style={{ marginTop: "3rem", borderTop: "1px solid var(--admin-border)", paddingTop: "2rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 300, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "1.5rem" }}>Lookbook Split Preview</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2px", background: "#000", border: "1px solid var(--admin-border)", padding: "2px", borderRadius: "12px", overflow: "hidden" }}>
                {/* Men's Preview */}
                <div style={{ position: "relative", height: "350px", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: "2rem" }}>
                  <img src={lookbookData.mens.image_url} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)", zIndex: 2 }}></div>
                  <div style={{ position: "relative", zIndex: 3, color: "#fff" }}>
                    <span style={{ fontSize: "0.65rem", letterSpacing: "2px", opacity: 0.8, textTransform: "uppercase" }}>LOOKBOOK</span>
                    <h4 style={{ fontSize: "1.4rem", fontWeight: 400, textTransform: "uppercase", margin: "0.4rem 0 1rem" }}>{lookbookData.mens.title}</h4>
                    <span style={{ fontSize: "0.75rem", borderBottom: "1px solid #fff", paddingBottom: "3px", textTransform: "uppercase", fontWeight: 600 }}>Shop &rarr;</span>
                  </div>
                </div>
                {/* Women's Preview */}
                <div style={{ position: "relative", height: "350px", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: "2rem" }}>
                  <img src={lookbookData.womens.image_url} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)", zIndex: 2 }}></div>
                  <div style={{ position: "relative", zIndex: 3, color: "#fff" }}>
                    <span style={{ fontSize: "0.65rem", letterSpacing: "2px", opacity: 0.8, textTransform: "uppercase" }}>LOOKBOOK</span>
                    <h4 style={{ fontSize: "1.4rem", fontWeight: 400, textTransform: "uppercase", margin: "0.4rem 0 1rem" }}>{lookbookData.womens.title}</h4>
                    <span style={{ fontSize: "0.75rem", borderBottom: "1px solid #fff", paddingBottom: "3px", textTransform: "uppercase", fontWeight: 600 }}>Shop &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CAMPAIGN SECTION TAB --- */}
        {activeTab === "campaign" && (
          <div>
            <div className="content-header">
              <h2>Campaign Video & Story Slides CMS</h2>
              <div style={{ display: "flex", gap: "1rem" }}>
                {isCampaignDirty && <span style={{ fontSize: "0.75rem", color: "orange", display: "flex", alignItems: "center" }}>⚠️ Unsaved Changes</span>}
                <button 
                  className="add-new-btn" 
                  onClick={handleSaveCampaign}
                  disabled={campaignSaving}
                >
                  {campaignSaving ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveCampaign(); }}>
              <div className="form-grid">
                {/* Background Video & Preview Thumbnail Section */}
                <div className="form-group full-width" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--borders)", padding: "2rem", borderRadius: "4px", marginBottom: "2rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 400, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "1.5rem", borderBottom: "1px solid var(--borders)", paddingBottom: "0.5rem" }}>
                    Background Video &amp; Preview Thumbnail
                  </h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <SingleImageManager 
                      value={campaignForm.video_url} 
                      onChange={(url) => {
                        setCampaignForm({ ...campaignForm, video_url: url });
                        setIsCampaignDirty(true);
                      }} 
                      label="Background Video URL (mp4, mkv)" 
                      type="media"
                      showToast={showToast} 
                    />

                    <SingleImageManager 
                      value={campaignForm.video_thumbnail_url || ""} 
                      onChange={(url) => {
                        setCampaignForm({ ...campaignForm, video_thumbnail_url: url });
                        setIsCampaignDirty(true);
                      }} 
                      label="Video Preview Thumbnail Image URL" 
                      type="image"
                      showToast={showToast} 
                    />
                  </div>
                </div>

                {/* Slides Section */}
                {campaignForm.slides.map((slide, idx) => (
                  <div key={idx} className="form-group full-width" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--borders)", padding: "2rem", borderRadius: "4px", marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 400, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "1.5rem", borderBottom: "1px solid var(--borders)", paddingBottom: "0.5rem" }}>
                      Slide #{idx + 1}
                    </h3>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                      <div className="form-group">
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.5px" }}>Slide Tag *</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={slide.tag} 
                          onChange={(e) => {
                            const newSlides = [...campaignForm.slides];
                            newSlides[idx] = { ...newSlides[idx], tag: e.target.value };
                            setCampaignForm({ ...campaignForm, slides: newSlides });
                            setIsCampaignDirty(true);
                          }} 
                          placeholder="e.g. THE VISION"
                          required 
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.5px" }}>Slide Heading *</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={slide.heading} 
                          onChange={(e) => {
                            const newSlides = [...campaignForm.slides];
                            newSlides[idx] = { ...newSlides[idx], heading: e.target.value };
                            setCampaignForm({ ...campaignForm, slides: newSlides });
                            setIsCampaignDirty(true);
                          }} 
                          placeholder="e.g. BEYOND THE ORDINARY."
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.5px" }}>Description Paragraph *</label>
                      <textarea 
                        className="form-input form-textarea" 
                        rows="3" 
                        value={slide.paragraph} 
                        onChange={(e) => {
                          const newSlides = [...campaignForm.slides];
                          newSlides[idx] = { ...newSlides[idx], paragraph: e.target.value };
                          setCampaignForm({ ...campaignForm, slides: newSlides });
                          setIsCampaignDirty(true);
                        }} 
                        placeholder="Slide description text..."
                        required 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>
        )}

        {/* --- PRODUCT DETAILS SETTINGS TAB --- */}
        {activeTab === "settings" && (
          <div>
            <div className="content-header">
              <h2>Website Settings & Controls</h2>
              <div style={{ display: "flex", gap: "1rem" }}>
                {isSettingsDirty && <span style={{ fontSize: "0.75rem", color: "orange", display: "flex", alignItems: "center" }}>⚠️ Unsaved Changes</span>}
                <button 
                  className="add-new-btn" 
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                >
                  {settingsSaving ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
              
              {/* APPEARANCE GROUP */}
              <div className="settings-group-card">
                <h3 className="settings-group-title">Appearance Settings</h3>
                
                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Theme Mode</h4>
                    <p>Select how the public website handles dark and light mode rendering.</p>
                  </div>
                  <div className="settings-action">
                    <select 
                      className="form-select" 
                      value={settingsForm.theme_mode} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, theme_mode: e.target.value }); setIsSettingsDirty(true); }}
                    >
                      <option value="always-dark">Always Dark</option>
                      <option value="always-light">Always Light</option>
                      <option value="user-controlled">User Controlled</option>
                      <option value="system-preference">System Preference</option>
                    </select>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Website Favicon</h4>
                    <p>Upload a custom .ico, .png, or .svg icon for the browser tab.</p>
                  </div>
                  <div className="settings-action" style={{ minWidth: "300px" }}>
                    <SingleImageManager 
                      value={settingsForm.favicon_url} 
                      onChange={(url) => { setSettingsForm({ ...settingsForm, favicon_url: url }); setIsSettingsDirty(true); }} 
                      label="" 
                      placeholder="/favicon.svg" 
                      showToast={showToast} 
                    />
                  </div>
                </div>

                <div className="settings-row-divider"></div>
                <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", margin: "1.5rem 0 1rem", opacity: 0.7 }}>Product Page Specifications Defaults</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label>Frame Material</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.frame_material} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, frame_material: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Lens Technology</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.lens_technology} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, lens_technology: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Warranty Package</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.warranty} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, warranty: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Origin</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.origin} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, origin: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Included Accessories Details</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.includes} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, includes: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                </div>
              </div>

              {/* NAVIGATION GROUP */}
              <div className="settings-group-card">
                <h3 className="settings-group-title">Navigation Controls</h3>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Always Black Navbar Background</h4>
                    <p>Enforce pure black background (#000000) for the top navigation bar across all themes (Light &amp; Dark mode).</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.navbar_black_background !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, navbar_black_background: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Navbar Sticky Mode</h4>
                    <p>Fix the header navigation bar at the top of the browser window when scrolling down.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.navbar_sticky_mode !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, navbar_sticky_mode: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Navbar Theme Toggle Visibility</h4>
                    <p>Display or hide the sun/moon theme toggler inside the navigation bar.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.show_navbar_theme_toggle !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, show_navbar_theme_toggle: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Social Links Visibility</h4>
                    <p>Toggle visibility of the CONNECT social column accordion inside the website footer.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.show_social_links !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, show_social_links: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ANIMATIONS & EFFECTS GROUP */}
              <div className="settings-group-card">
                <h3 className="settings-group-title">Animations &amp; Visual Effects</h3>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Smooth Scroll</h4>
                    <p>Enable fluid, momentum-based page scroll physics powered by Lenis.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.enable_smooth_scroll !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, enable_smooth_scroll: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Page Loader</h4>
                    <p>Show a dynamic loading preloader overlay on the public site landing mount.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.enable_page_loader !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, enable_page_loader: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Typing Animation</h4>
                    <p>Apply letter-by-letter typing animation to the slider subtitles in the Hero section.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.enable_typing_animation !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, enable_typing_animation: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Cursor Effect</h4>
                    <p>Render a custom dynamic fluid cursor dot and trailing focus ring following the pointer.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.enable_cursor_effect !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, enable_cursor_effect: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Section Animations</h4>
                    <p>Activate entrance fade and scroll-triggered motion transitions globally.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.enable_section_animations !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, enable_section_animations: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Product Cards Image Hover Swap</h4>
                    <p>Enable secondary product image swap on hovering cards in the Shop Catalog.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.enable_image_hover !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, enable_image_hover: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>



              {/* CONTACT & SOCIAL GROUP */}
              <div className="settings-group-card">
                <h3 className="settings-group-title">Contact &amp; Social Panel</h3>

                <div className="settings-row">
                  <div className="settings-info">
                    <h4>Contact Form Submission</h4>
                    <p>Toggle active contact form submission grid page vs concierge Advisory Notice.</p>
                  </div>
                  <div className="settings-action">
                    <label className="switch-control">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.enable_contact_form !== false} 
                        onChange={(e) => { setSettingsForm({ ...settingsForm, enable_contact_form: e.target.checked }); setIsSettingsDirty(true); }} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row-divider"></div>
                <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", margin: "1.5rem 0 1rem", opacity: 0.7 }}>Advisory Concierge &amp; Contact Drawer Content</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label>Helpline Phone Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.contact_phone} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, contact_phone: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Support Desk Email</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.contact_email} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, contact_email: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Hours of Operation</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.contact_hours} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, contact_hours: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Average Response Notice</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.contact_response} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, contact_response: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                </div>

                <div className="settings-row-divider"></div>
                <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", margin: "1.5rem 0 1rem", opacity: 0.7 }}>Shipping, Return, &amp; Appointment Drawers Defaults</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label>Standard Shipping Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.shipping_standard_title} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, shipping_standard_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Standard Shipping Description</label>
                    <textarea 
                      className="form-input form-textarea" 
                      rows="2"
                      value={settingsForm.shipping_standard_desc} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, shipping_standard_desc: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Shipping Options Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.shipping_express_title} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, shipping_express_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Shipping Options Description</label>
                    <textarea 
                      className="form-input form-textarea" 
                      rows="2"
                      value={settingsForm.shipping_express_desc} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, shipping_express_desc: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Returns Drawer Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.returns_title} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, returns_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Returns Drawer Description</label>
                    <textarea 
                      className="form-input form-textarea" 
                      rows="2"
                      value={settingsForm.returns_desc} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, returns_desc: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Book Appointment Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.appointment_title} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, appointment_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment Info Description</label>
                    <textarea 
                      className="form-input form-textarea" 
                      rows="2"
                      value={settingsForm.appointment_desc} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, appointment_desc: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Concierge Appointment Helpline</label>
                    <textarea 
                      className="form-input form-textarea" 
                      rows="2"
                      value={settingsForm.appointment_how} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, appointment_how: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER CUSTOMIZATION GROUP */}
              <div className="settings-group-card">
                <h3 className="settings-group-title">Footer Content Customization</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label>Newsletter Subtitle Headline</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_newsletter_title || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_newsletter_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Footer Contact Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={settingsForm.footer_email || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_email: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Instagram Link URL</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_social_instagram || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_social_instagram: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Pinterest Link URL</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_social_pinterest || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_social_pinterest: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Copyright Brand Notice</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_copyright || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_copyright: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Footer Tagline / Brand Slogan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_tagline || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_tagline: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                </div>

                <div className="settings-row-divider"></div>
                <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", margin: "1.5rem 0 1rem", opacity: 0.7 }}>Footer Accordion Column Titles</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label>Contact Section Header</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_contact_title || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_contact_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Connect Section Header</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_connect_title || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_connect_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Content Section Header</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_content_title || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_content_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Legal Section Header</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={settingsForm.footer_legal_title || ""} 
                      onChange={(e) => { setSettingsForm({ ...settingsForm, footer_legal_title: e.target.value }); setIsSettingsDirty(true); }} 
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>
        )}
        </div>
      </main>

      {/* --- TOAST NOTIFICATIONS --- */}
      {toast && (
        <div className="admin-toast" style={{ borderLeftColor: toast.type === "error" ? "#ff4a4a" : "#2ed573" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {toast.type === "error" ? <AlertTriangle size={16} color="#ff4a4a" /> : <CheckCircle size={16} color="#2ed573" />}
            <span>{toast.message.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* --- MODAL EDITORS --- */}
      {productModal.open && (
        <ProductFormModal 
          isOpen={productModal.open}
          isEdit={productModal.isEdit}
          initialData={productModal.data}
          categories={categories}
          onClose={() => setProductModal({ open: false, isEdit: false, data: null })}
          onSave={() => {
            fetchProducts();
            fetchStats();
            setProductModal({ open: false, isEdit: false, data: null });
            showToast("Product saved successfully");
          }}
          showToast={showToast}
        />
      )}

      {categoryModal.open && (
        <CategoryFormModal
          isOpen={categoryModal.open}
          isEdit={categoryModal.isEdit}
          initialData={categoryModal.data}
          onClose={() => setCategoryModal({ open: false, isEdit: false, data: null })}
          onSave={() => {
            fetchCategories();
            fetchStats();
            setCategoryModal({ open: false, isEdit: false, data: null });
            showToast("Category saved successfully");
          }}
          showToast={showToast}
        />
      )}

      {bannerModal.open && (
        <BannerFormModal
          isOpen={bannerModal.open}
          isEdit={bannerModal.isEdit}
          initialData={bannerModal.data}
          onClose={() => setBannerModal({ open: false, isEdit: false, data: null })}
          onSave={() => {
            fetchBanners();
            setBannerModal({ open: false, isEdit: false, data: null });
            showToast("Hero Banner saved successfully");
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
}

// ==========================================
// --- PRODUCT FORM MODAL COMPONENT ---
// ==========================================
function ProductFormModal({ isOpen, isEdit, initialData, categories, onClose, onSave, showToast }) {
  const [submitting, setSubmitting] = useState(false);
  
  // Basic Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("$245.00");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("50");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(true);
  const [newArrival, setNewArrival] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [frameMaterial, setFrameMaterial] = useState("");
  const [lensTechnology, setLensTechnology] = useState("");
  const [warranty, setWarranty] = useState("");
  const [origin, setOrigin] = useState("");
  const [includes, setIncludes] = useState("");
  const [appointmentInfo, setAppointmentInfo] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [tags, setTags] = useState("");

  // Primary image
  const [image, setImage] = useState("");
  const [secondaryImage, setSecondaryImage] = useState("");

  // Nested Variants State
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (isEdit && initialData) {
      setName(initialData.name || "");
      setSku(initialData.sku || "");
      setCategoryId(initialData.category_id || "");
      setPrice(initialData.price || "$245.00");
      setDiscountPrice(initialData.discount_price || "");
      setStock(String(initialData.stock || "50"));
      setStatus(initialData.status || "draft");
      setFeatured(initialData.featured);
      setNewArrival(initialData.new_arrival);
      setBestseller(initialData.bestseller);
      setDescription(initialData.description || "");
      setSpecifications(initialData.specifications || "");
      setFrameMaterial(initialData.frame_material || "");
      setLensTechnology(initialData.lens_technology || "");
      setWarranty(initialData.warranty || "");
      setOrigin(initialData.origin || "");
      setIncludes(initialData.includes || "");
      setAppointmentInfo(initialData.appointment_info || "");
      setContactInfo(initialData.contact_info || "");
      setTags(initialData.tags || "");
      setImage(initialData.image || "");
      setSecondaryImage(initialData.secondaryImage || "");

      // Load variants object to array format
      const vArr = Object.entries(initialData.variants || {}).map(([key, v]) => ({
        variant_key: key,
        code: v.code || "",
        name: v.name || "",
        color: v.color || "",
        price: v.price || "",
        thumb: v.thumb || "",
        images: v.images || [],
        description: v.description || "",
        details: v.details || "",
        size: v.size || "",
        shipping: v.shipping || "",
      }));
      setVariants(vArr);
    } else {
      // Seed an initial variant to make creation easy
      setVariants([{
        variant_key: "black",
        code: "001",
        name: "ANIMA X1",
        color: "Black",
        price: "$245.00",
        thumb: "",
        images: [],
        description: "",
        details: "Premium handcrafted acetate frame designed for luxury.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      }]);
    }
  }, [isEdit, initialData]);

  const addVariant = () => {
    setVariants([...variants, {
      variant_key: "variant_" + Date.now().toString().slice(-4),
      code: "",
      name: name || "ANIMA X1",
      color: "",
      price: price || "$245.00",
      thumb: "",
      images: [],
      description: description || "",
      details: "Premium handcrafted acetate frame designed for luxury.",
      size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
      shipping: "Free worldwide shipping. Easy returns within 30 days.",
    }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantField = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !sku || !price) {
      showToast("Name, SKU and Price are required", "error");
      return;
    }

    if (variants.length === 0) {
      showToast("At least one variation must be configured", "error");
      return;
    }

    // Convert variants array back to expected keyed object format
    const variantsObj = {};
    variants.forEach((v) => {
      const vKey = v.variant_key.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      variantsObj[vKey] = {
        code: v.code,
        name: v.name || name,
        color: v.color || v.variant_key,
        price: v.price || price,
        thumb: v.thumb || v.images[0] || "",
        images: v.images,
        description: v.description || description,
        details: v.details,
        size: v.size || specifications,
        shipping: v.shipping,
      };
    });

    // Auto assign main product image if not set
    const mainImg = image || variants[0]?.images[0] || "";
    const secImg = secondaryImage || variants[0]?.images[1] || mainImg;

    const payload = {
      name,
      sku,
      category_id: categoryId || null,
      price,
      discount_price: discountPrice || null,
      stock: parseInt(stock),
      status,
      featured,
      new_arrival: newArrival,
      bestseller,
      description,
      specifications,
      frame_material: frameMaterial,
      lens_technology: lensTechnology,
      warranty,
      origin,
      includes,
      appointment_info: appointmentInfo,
      contact_info: contactInfo,
      tags,
      image: mainImg,
      secondary_image: secImg,
      variants: variantsObj,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await API.put(`/products/${initialData.id}`, payload);
      } else {
        await API.post("/products", payload);
      }
      onSave();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X /></button>
        <h3>{isEdit ? "Edit Product" : "Create Product"}</h3>

        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label>SKU Code *</label>
              <input type="text" className="form-input" value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Price * (e.g. $245.00)</label>
              <input type="text" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Discount Price</label>
              <input type="text" className="form-input" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Stock Count</label>
              <input type="number" className="form-input" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="form-group">
              <label>Homepage Tags / Badges</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                  Featured
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} />
                  New Arrival
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} />
                  Bestseller
                </label>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea className="form-input form-textarea" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Specifications (Size & Fit, e.g. Lens Width 52mm...)</label>
              <input type="text" className="form-input" value={specifications} onChange={(e) => setSpecifications(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Tags (Comma separated, e.g. classic, square, luxury)</label>
              <input type="text" className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Frame Material (Optional - defaults to global settings if empty)</label>
              <input type="text" className="form-input" value={frameMaterial} onChange={(e) => setFrameMaterial(e.target.value)} placeholder="e.g. Premium Cellulose Acetate" />
            </div>

            <div className="form-group">
              <label>Lens Technology (Optional - defaults to global settings if empty)</label>
              <input type="text" className="form-input" value={lensTechnology} onChange={(e) => setLensTechnology(e.target.value)} placeholder="e.g. 100% UVA/UVB Protection" />
            </div>

            <div className="form-group">
              <label>Warranty (Optional - defaults to global settings if empty)</label>
              <input type="text" className="form-input" value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="e.g. 2-Year International Warranty" />
            </div>

            <div className="form-group">
              <label>Origin (Optional - defaults to global settings if empty)</label>
              <input type="text" className="form-input" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Handcrafted in Italy" />
            </div>

            <div className="form-group full-width">
              <label>Includes (Optional - defaults to global settings if empty)</label>
              <input type="text" className="form-input" value={includes} onChange={(e) => setIncludes(e.target.value)} placeholder="e.g. Premium leather case, microfiber cloth" />
            </div>

            <div className="form-group full-width">
              <label>Custom Appointment Info (Optional - defaults to global settings if empty)</label>
              <textarea className="form-input form-textarea" rows="2" value={appointmentInfo} onChange={(e) => setAppointmentInfo(e.target.value)} placeholder="e.g. Booking details, timings override for this specific product..." />
            </div>

            <div className="form-group full-width">
              <label>Custom Contact Info (Optional - defaults to global settings if empty)</label>
              <textarea className="form-input form-textarea" rows="2" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="e.g. Direct helpline or email overrides for this specific product..." />
            </div>

            <div className="form-group full-width">
              <SingleImageManager 
                value={image} 
                onChange={setImage} 
                label="Override Primary Image URL (Optional)" 
                placeholder="Will auto-use first variant image if empty"
                type="image"
                showToast={showToast} 
              />
            </div>

            <div className="form-group full-width">
              <SingleImageManager 
                value={secondaryImage} 
                onChange={setSecondaryImage} 
                label="Override Secondary Image URL (Optional)" 
                type="image"
                showToast={showToast} 
              />
            </div>
          </div>

          {/* Nested Variants Section */}
          <div className="variants-section">
            <div className="variants-section-header">
              <h4>Configure Color/Variant Styles ({variants.length})</h4>
              <button type="button" className="add-new-btn" style={{ fontSize: "0.7rem", padding: "0.4rem 0.8rem" }} onClick={addVariant}>
                + Add Variant Style
              </button>
            </div>

            {variants.map((v, index) => (
              <div className="variant-card" key={index}>
                {variants.length > 1 && (
                  <button type="button" className="remove-variant-btn" onClick={() => removeVariant(index)}>
                    Remove Variant
                  </button>
                )}

                <div className="form-grid" style={{ marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label>Variant Key (Unique, e.g. tortoise, olive, red, black) *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={v.variant_key} 
                      onChange={(e) => updateVariantField(index, "variant_key", e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Variant Code / Number *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={v.code} 
                      onChange={(e) => updateVariantField(index, "code", e.target.value)} 
                      placeholder="e.g. 001"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Color Display Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={v.color} 
                      onChange={(e) => updateVariantField(index, "color", e.target.value)} 
                      placeholder="e.g. Tortoise Brown"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Specific Price Override</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={v.price} 
                      onChange={(e) => updateVariantField(index, "price", e.target.value)} 
                      placeholder="Default matches parent"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Variant Description Override</label>
                    <textarea 
                      className="form-input form-textarea" 
                      rows="2" 
                      value={v.description} 
                      onChange={(e) => updateVariantField(index, "description", e.target.value)} 
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Product Details (Accordion)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={v.details} 
                      onChange={(e) => updateVariantField(index, "details", e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Size / Dimensions Specs Override</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={v.size} 
                      onChange={(e) => updateVariantField(index, "size", e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Shipping Info Accordion</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={v.shipping} 
                      onChange={(e) => updateVariantField(index, "shipping", e.target.value)} 
                    />
                  </div>
                </div>

                {/* Variant Images Manager */}
                <ImageManager 
                  images={v.images} 
                  thumb={v.thumb}
                  onImagesChange={(imgs) => updateVariantField(index, "images", imgs)}
                  onThumbChange={(t) => updateVariantField(index, "thumb", t)}
                  showToast={showToast}
                />

              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="submit-form-btn" disabled={submitting}>
              {submitting ? "Saving Product..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// --- IMAGE MANAGER SERVICE COMPONENT ---
// ==========================================
function ImageManager({ images, thumb, onImagesChange, onThumbChange, showToast }) {
  const [pasteUrl, setPasteUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  // Drag over handler
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      showToast("File size exceeds 100MB limit", "error");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      setProgress(40);
      
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setProgress(100);
      showToast("Uploaded successfully to Cloudinary");
      
      const newImages = [...images, res.data.url];
      onImagesChange(newImages);
      
      // Auto assign thumb if none exists
      if (!thumb) {
        onThumbChange(res.data.url);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "File upload failed", "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Drop handler
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  // Paste Image URL handler (Method 2)
  const handleUrlPaste = async (e) => {
    e.preventDefault();
    if (!pasteUrl) return;

    try {
      setUploading(true);
      const res = await API.post("/upload/validate-url", { url: pasteUrl });
      
      const newImages = [...images, res.data.url];
      onImagesChange(newImages);
      
      // Auto assign thumb if none exists
      if (!thumb) {
        onThumbChange(res.data.url);
      }
      
      setPasteUrl("");
      showToast("Image URL added successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid image URL", "error");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (indexToRemove) => {
    const imageUrl = images[indexToRemove];
    const updated = images.filter((_, i) => i !== indexToRemove);
    onImagesChange(updated);
    
    // If thumb was removed, reset it
    if (thumb === imageUrl && updated.length > 0) {
      onThumbChange(updated[0]);
    } else if (updated.length === 0) {
      onThumbChange("");
    }

    // Call API to remove from Cloudinary
    if (imageUrl && imageUrl.includes("res.cloudinary.com")) {
      try {
        await API.post("/upload/delete", { url: imageUrl });
        showToast("Removed from Cloudinary storage");
      } catch (err) {
        console.warn("Cloudinary delete failed:", err);
      }
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.6)" }}>IMAGES GALLERY & PRIMARY THUMB</label>
      
      <div className="image-upload-wrapper">
        
        {/* Method 1: Local Drag & Drop Upload */}
        <div 
          className={`upload-method-box ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer" }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                await uploadFile(e.target.files[0]);
              }
            }}
          />
          <Upload size={20} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, marginTop: "0.4rem" }}>Drag & Drop Image/Video File</span>
          <span>Max size: 100MB (JPG, WEBP, PNG, MP4, WEBM, MKV, MOV)</span>
          {uploading && progress > 0 && <div className="upload-progress">Uploading: {progress}%</div>}
        </div>

        {/* Method 2: Paste Image URL */}
        <div className="upload-method-box" style={{ padding: "1rem" }} onClick={(e) => e.stopPropagation()}>
          <Link2 size={20} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, marginTop: "0.4rem", marginBottom: "0.4rem" }}>Paste External Image URL</span>
          <div style={{ display: "flex", gap: "0.4rem", width: "100%" }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="https://example.com/image.jpg" 
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              style={{ fontSize: "0.75rem", height: "30px", flexGrow: 1 }}
            />
            <button type="button" className="add-new-btn" style={{ height: "30px", padding: "0 0.8rem", fontSize: "0.65rem" }} onClick={handleUrlPaste}>
              Add
            </button>
          </div>
        </div>

      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontSize: "0.7rem", opacity: 0.6, marginBottom: "0.4rem" }}>Click preview thumbnail to set as main thumbnail display icon (boxed outline indicates active selection):</div>
          <div className="image-previews-grid">
            {images.map((img, i) => (
              <div 
                className="preview-thumb-container" 
                key={i} 
                style={{ borderColor: thumb === img ? "#2ed573" : "rgba(255, 255, 255, 0.1)", borderWidth: thumb === img ? "2px" : "1px" }}
                onClick={() => onThumbChange(img)}
                title="Select as primary color thumb icon"
              >
                <img src={img} alt="Preview" />
                <button type="button" className="remove-thumb-btn" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// --- CATEGORY FORM MODAL COMPONENT ---
// ==========================================
function CategoryFormModal({ isOpen, isEdit, initialData, onClose, onSave, showToast }) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [logo, setLogo] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (isEdit && initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setDescription(initialData.description || "");
      setImage(initialData.image || "");
      setLogo(initialData.logo || "");
      setStatus(initialData.status || "active");
    }
  }, [isEdit, initialData]);

  // Autogenerate slug when name changes during creation
  const handleNameChange = (val) => {
    setName(val);
    if (!isEdit) {
      const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !slug) {
      showToast("Name and slug are required", "error");
      return;
    }

    const payload = { name, slug, description, image, logo, status };

    try {
      setSubmitting(true);
      if (isEdit) {
        await API.put(`/categories/${initialData.id}`, payload);
      } else {
        await API.post("/categories", payload);
      }
      onSave();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X /></button>
        <h3>{isEdit ? "Edit Category" : "Create Category"}</h3>

        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label>Category Name *</label>
              <input type="text" className="form-input" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Slug / Route Identifier *</label>
              <input type="text" className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea className="form-input form-textarea" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="form-group full-width">
              <SingleImageManager 
                value={image} 
                onChange={setImage} 
                label="Showcase Background Image" 
                type="image"
                showToast={showToast} 
              />
            </div>

            <div className="form-group full-width">
              <SingleImageManager 
                value={logo} 
                onChange={setLogo} 
                label="Collection Logo / Thumbnail" 
                type="image"
                showToast={showToast} 
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="submit-form-btn" disabled={submitting}>
              {submitting ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// --- BANNER FORM MODAL COMPONENT ---
// ==========================================
function BannerFormModal({ isOpen, isEdit, initialData, onClose, onSave, showToast }) {
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroVideo, setHeroVideo] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [bannerOrder, setBannerOrder] = useState("0");
  const [activeStatus, setActiveStatus] = useState(true);

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setSubtitle(initialData.subtitle || "");
      setHeroImage(initialData.hero_image || "");
      setHeroVideo(initialData.hero_video || "");
      setButtonText(initialData.button_text || "");
      setButtonLink(initialData.button_link || "");
      setBannerOrder(String(initialData.banner_order || "0"));
      setActiveStatus(Boolean(initialData.active_status));
    }
  }, [isEdit, initialData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title) {
      showToast("Banner title is required", "error");
      return;
    }

    const payload = {
      title,
      subtitle,
      hero_image: heroImage || null,
      hero_video: heroVideo || null,
      button_text: buttonText,
      button_link: buttonLink,
      banner_order: parseInt(bannerOrder),
      active_status: activeStatus,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await API.put(`/dashboard/hero/${initialData.id}`, payload);
      } else {
        await API.post("/dashboard/hero", payload);
      }
      onSave();
    } catch (err) {
      showToast("Failed to save hero banner config", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X /></button>
        <h3>{isEdit ? "Edit Hero Banner" : "Create Hero Banner"}</h3>

        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Hero Title * (supports new line breaks)</label>
              <textarea className="form-input form-textarea" rows="2" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="form-group full-width">
              <label>Hero Subtitle description</label>
              <input type="text" className="form-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            <div className="form-group full-width">
              <SingleImageManager 
                value={heroVideo} 
                onChange={setHeroVideo} 
                label="Hero Background Video" 
                placeholder="e.g. /assets/hero3.mkv"
                type="media"
                showToast={showToast} 
              />
            </div>

            <div className="form-group full-width">
              <SingleImageManager 
                value={heroImage} 
                onChange={setHeroImage} 
                label="Hero Background Image (alternative fallback)" 
                type="image"
                showToast={showToast} 
              />
            </div>

            <div className="form-group">
              <label>Button Text (optional)</label>
              <input type="text" className="form-input" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Button Action Link</label>
              <input type="text" className="form-input" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Banner Sort Order</label>
              <input type="number" className="form-input" value={bannerOrder} onChange={(e) => setBannerOrder(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Active Display Status</label>
              <select className="form-select" value={activeStatus ? "1" : "0"} onChange={(e) => setActiveStatus(e.target.value === "1")}>
                <option value="1">Active (Visible)</option>
                <option value="0">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="submit-form-btn" disabled={submitting}>
              {submitting ? "Saving..." : "Save Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// --- SINGLE IMAGE MANAGER COMPONENT ---
// ==========================================
function SingleImageManager({ value, onChange, label, placeholder = "", type = "image", showToast }) {
  const [pasteUrl, setPasteUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      showToast("File size exceeds 100MB limit", "error");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      setProgress(40);
      
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setProgress(100);
      showToast("Uploaded successfully to Cloudinary");
      onChange(res.data.url);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "File upload failed", "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlPaste = async (e) => {
    e.preventDefault();
    if (!pasteUrl) return;

    if (type === "media" && (pasteUrl.endsWith(".mp4") || pasteUrl.endsWith(".mkv") || pasteUrl.endsWith(".mov") || pasteUrl.endsWith(".webm"))) {
      onChange(pasteUrl);
      setPasteUrl("");
      showToast("Media URL added successfully");
      return;
    }

    try {
      setUploading(true);
      const res = await API.post("/upload/validate-url", { url: pasteUrl });
      onChange(res.data.url);
      setPasteUrl("");
      showToast("Image URL updated successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid image URL", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group full-width" style={{ marginTop: "0.5rem" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.6)" }}>{label}</label>
      
      {value && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem", background: "var(--admin-bg-soft)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--admin-border)", width: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          {type === "image" || (!value.endsWith(".mkv") && !value.endsWith(".mp4") && !value.endsWith(".webm") && !value.endsWith(".mov")) ? (
            <img src={value} alt="Preview" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
          ) : (
            <div style={{ width: "44px", height: "44px", background: "var(--admin-bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", borderRadius: "6px", flexShrink: 0, fontWeight: 700 }}>VIDEO</div>
          )}
          <div style={{ flex: "1 1 0%", minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--admin-text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={value}>
              {value.length > 40 ? `${value.substring(0, 26)}...${value.substring(value.length - 10)}` : value}
            </div>
          </div>
          <button 
            type="button" 
            className="remove-variant-btn" 
            style={{ position: "static", color: "#ff4a4a", flexShrink: 0, fontSize: "0.72rem" }} 
            onClick={async () => {
              const urlToDelete = value;
              onChange("");
              if (urlToDelete && urlToDelete.includes("res.cloudinary.com")) {
                try {
                  await API.post("/upload/delete", { url: urlToDelete });
                  showToast("Removed from Cloudinary storage");
                } catch (err) {
                  console.warn("Cloudinary delete failed:", err);
                }
              }
            }}
          >
            Remove
          </button>
        </div>
      )}

      <div className="image-upload-wrapper" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div 
          className={`upload-method-box ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer", minHeight: "100px" }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            accept={type === "media" ? "image/*,video/*" : "image/*"}
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                await uploadFile(e.target.files[0]);
              }
            }}
          />
          <Upload size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: "0.7rem", fontWeight: 600, marginTop: "0.2rem" }}>Choose or Drop {type === "media" ? "Media" : "Image"}</span>
          {uploading && progress > 0 && <div className="upload-progress">Uploading: {progress}%</div>}
        </div>

        <div className="upload-method-box" style={{ padding: "0.8rem", minHeight: "100px" }} onClick={(e) => e.stopPropagation()}>
          <Link2 size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: "0.7rem", fontWeight: 600, marginTop: "0.2rem", marginBottom: "0.2rem" }}>Paste URL Address</span>
          <div style={{ display: "flex", gap: "0.4rem", width: "100%" }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder={placeholder || "https://..."} 
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              style={{ fontSize: "0.7rem", height: "28px", flexGrow: 1 }}
            />
            <button type="button" className="add-new-btn" style={{ height: "28px", padding: "0 0.6rem", fontSize: "0.6rem" }} onClick={handleUrlPaste}>
              Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
