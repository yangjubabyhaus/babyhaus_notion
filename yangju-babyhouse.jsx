import { useState, useEffect } from "react";

/* ─── 유틸 ─── */
function formatDate(d) {
  const days = ["일","월","화","수","목","금","토"];
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}
function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function load(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function fmtSize(b) { if (b < 1024) return b + " B"; if (b < 1048576) return (b / 1024).toFixed(1) + " KB"; return (b / 1048576).toFixed(1) + " MB"; }
function getExt(n) { return n.split(".").pop().toLowerCase(); }

const NOTICE_CATS = [
  { key: "긴급", color: "#dc2626", bg: "#fef2f2" },
  { key: "안내", color: "#0d9488", bg: "#f0fdfa" },
  { key: "업데이트", color: "#7c3aed", bg: "#f5f3ff" },
];

const CAT_META = {
  "현금브랜드": { label: "현금 · 브랜드 지급", color: "#b45309", bg: "#fef3c7", border: "#fbbf24" },
  "상품권브랜드": { label: "상품권 · 브랜드 지급", color: "#7c3aed", bg: "#ede9fe", border: "#a78bfa" },
  "현금매장": { label: "현금 · 매장 지급", color: "#047857", bg: "#d1fae5", border: "#34d399" },
};
const CAT_ORDER = ["현금브랜드", "상품권브랜드", "현금매장"];

const DEFAULT_PRODUCTS = [
  { id: 1, brand: "INGLESINA", name: "앱티카", amount: 20000, type: "현금", source: "브랜드", category: "현금브랜드" },
  { id: 2, brand: "INGLESINA", name: "일렉타", amount: 20000, type: "현금", source: "브랜드", category: "현금브랜드" },
  { id: 3, brand: "SWANDOO", name: "마리5", amount: 20000, type: "현금", source: "브랜드", category: "현금브랜드" },
  { id: 4, brand: "SWANDOO", name: "찰리2", amount: 20000, type: "현금", source: "브랜드", category: "현금브랜드" },
  { id: 5, brand: "MIMA", name: "크레오", amount: 50000, type: "상품권", source: "브랜드", category: "상품권브랜드" },
  { id: 6, brand: "NUNA", name: "스위브", amount: 50000, type: "상품권", source: "브랜드", category: "상품권브랜드" },
  { id: 7, brand: "HYBRID", name: "사이러스2 플러스", amount: 20000, type: "상품권", source: "브랜드", category: "상품권브랜드" },
  { id: 8, brand: "BUGABOO", name: "비6", amount: 30000, type: "현금", source: "매장", category: "현금매장" },
  { id: 9, brand: "FORB", name: "프리아핏에어", amount: 15000, type: "현금", source: "매장", category: "현금매장" },
  { id: 10, brand: "POGNAE", name: "맥스플로우", amount: 10000, type: "현금", source: "매장", category: "현금매장" },
  { id: 11, brand: "POGNAE", name: "맥스플로우라이트", amount: 10000, type: "현금", source: "매장", category: "현금매장" },
  { id: 12, brand: "DR.DIAL", name: "폴드에어", amount: 10000, type: "현금", source: "매장", category: "현금매장" },
];

const FILE_ICONS = { pdf:"📕",doc:"📘",docx:"📘",xls:"📗",xlsx:"📗",ppt:"📙",pptx:"📙",jpg:"🖼️",jpeg:"🖼️",png:"🖼️",gif:"🖼️",webp:"🖼️",svg:"🖼️",mp4:"🎬",mov:"🎬",webm:"🎬",mp3:"🎵",wav:"🎵",txt:"📄",csv:"📄",json:"📄",html:"🌐",zip:"📦",rar:"📦" };
function getIcon(n) { return FILE_ICONS[getExt(n)] || "📎"; }

/* 파일 타입 분류 */
function getFileType(name) {
  const ext = getExt(name);
  if (["jpg","jpeg","png","gif","webp","svg","bmp"].includes(ext)) return "image";
  if (["mp4","mov","webm","ogg"].includes(ext)) return "video";
  if (["mp3","wav","ogg","aac","m4a"].includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (["txt","csv","json","xml","html","css","js","ts","md","log"].includes(ext)) return "text";
  return "other";
}

/* ─── 파일 뷰어 컴포넌트 ─── */
function FileViewer({ file, onClose }) {
  const type = getFileType(file.name);
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    if (type === "text" && file.data) {
      try {
        const base64 = file.data.split(",")[1];
        const decoded = atob(base64);
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
        const text = new TextDecoder("utf-8").decode(bytes);
        setTextContent(text);
      } catch { setTextContent("파일을 읽을 수 없습니다."); }
    }
  }, [file, type]);

  const download = () => { const a = document.createElement("a"); a.href = file.data; a.download = file.name; a.click(); };

  return (
    <div className="fv-bg">
      {/* 헤더 */}
      <div className="fv-header">
        <button className="fv-back" onClick={onClose}>← 돌아가기</button>
        <div className="fv-title-area">
          <span className="fv-icon">{getIcon(file.name)}</span>
          <div>
            <div className="fv-filename">{file.name}</div>
            <div className="fv-filemeta">{fmtSize(file.size)} · {file.date}</div>
          </div>
        </div>
        <button className="fv-dl-btn" onClick={download}>⬇ 다운로드</button>
      </div>

      {/* 뷰어 본체 */}
      <div className="fv-body">
        {type === "image" && (
          <div className="fv-image-wrap">
            <img src={file.data} alt={file.name} className="fv-image" />
          </div>
        )}

        {type === "video" && (
          <div className="fv-video-wrap">
            <video controls className="fv-video" src={file.data}>
              브라우저가 동영상을 지원하지 않습니다.
            </video>
          </div>
        )}

        {type === "audio" && (
          <div className="fv-audio-wrap">
            <div className="fv-audio-icon">🎵</div>
            <div className="fv-audio-name">{file.name}</div>
            <audio controls src={file.data} style={{ width: "100%", maxWidth: 500 }}>
              브라우저가 오디오를 지원하지 않습니다.
            </audio>
          </div>
        )}

        {type === "pdf" && (
          <div className="fv-pdf-wrap">
            <iframe src={file.data} className="fv-pdf" title={file.name} />
          </div>
        )}

        {type === "text" && (
          <div className="fv-text-wrap">
            <pre className="fv-text">{textContent}</pre>
          </div>
        )}

        {type === "other" && (
          <div className="fv-other">
            <div style={{ fontSize: 48, marginBottom: 16 }}>{getIcon(file.name)}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{file.name}</div>
            <div style={{ fontSize: 14, color: "#999", marginBottom: 20 }}>
              미리보기를 지원하지 않는 파일 형식입니다.
            </div>
            <button className="yb-btn" onClick={download}>⬇ 다운로드</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 메인 앱 ─── */
export default function App() {
  const [tab, setTab] = useState("notice");
  const [notices, setNotices] = useState(() => load("yb_notices", []));
  const [todos, setTodos] = useState(() => load("yb_todos", {}));
  const [products, setProducts] = useState(() => load("yb_products", DEFAULT_PRODUCTS));
  const [productImages, setProductImages] = useState(() => load("yb_images", {}));
  const [logoUrl, setLogoUrl] = useState(() => load("yb_logo", ""));
  const [eduFiles, setEduFiles] = useState(() => load("yb_edu", []));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newNotice, setNewNotice] = useState("");
  const [noticeCat, setNoticeCat] = useState("안내");
  const [newTodo, setNewTodo] = useState("");
  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState({ brand: "", name: "", amount: "", category: "현금브랜드" });
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => save("yb_notices", notices), [notices]);
  useEffect(() => save("yb_todos", todos), [todos]);
  useEffect(() => save("yb_products", products), [products]);
  useEffect(() => save("yb_images", productImages), [productImages]);
  useEffect(() => save("yb_logo", logoUrl), [logoUrl]);
  useEffect(() => save("yb_edu", eduFiles), [eduFiles]);

  const dateKey = toKey(selectedDate);
  const dayTodos = todos[dateKey] || [];
  const isToday = toKey(new Date()) === dateKey;

  const addNotice = () => {
    if (!newNotice.trim()) return;
    setNotices(p => [{ id: Date.now(), text: newNotice.trim(), cat: noticeCat, date: new Date().toLocaleDateString("ko-KR") }, ...p]);
    setNewNotice("");
  };
  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos(p => ({ ...p, [dateKey]: [...(p[dateKey] || []), { id: Date.now(), text: newTodo.trim(), done: false }] }));
    setNewTodo("");
  };
  const toggleTodo = (id) => setTodos(p => ({ ...p, [dateKey]: (p[dateKey] || []).map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  const removeTodo = (id) => setTodos(p => ({ ...p, [dateKey]: (p[dateKey] || []).filter(t => t.id !== id) }));

  const openAddModal = () => { setModalForm({ brand: "", name: "", amount: "", category: "현금브랜드" }); setModal({ mode: "add" }); };
  const openEditModal = (item) => { setModalForm({ brand: item.brand, name: item.name, amount: String(item.amount), category: item.category }); setModal({ mode: "edit", product: item }); };
  const closeModal = () => setModal(null);
  const saveModal = () => {
    if (!modalForm.brand.trim() || !modalForm.name.trim() || !modalForm.amount) return;
    const cat = modalForm.category;
    const type = cat === "상품권브랜드" ? "상품권" : "현금";
    const source = cat === "현금매장" ? "매장" : "브랜드";
    const entry = { brand: modalForm.brand.trim().toUpperCase(), name: modalForm.name.trim(), amount: parseInt(modalForm.amount), type, source, category: cat };
    if (modal.mode === "add") setProducts(p => [...p, { id: Date.now(), ...entry }]);
    else setProducts(p => p.map(x => x.id === modal.product.id ? { ...x, ...entry } : x));
    closeModal();
  };
  const removeProduct = (id) => { setProducts(p => p.filter(x => x.id !== id)); setProductImages(p => { const c = { ...p }; delete c[id]; return c; }); };
  const handleImgUpload = (pid, e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = (ev) => setProductImages(p => ({ ...p, [pid]: ev.target.result })); r.readAsDataURL(file); };
  const handleLogoUpload = (e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = (ev) => setLogoUrl(ev.target.result); r.readAsDataURL(file); };
  const handleEduUpload = (e) => {
    Array.from(e.target.files || []).forEach(file => {
      const r = new FileReader();
      r.onload = (ev) => setEduFiles(p => [...p, { id: Date.now() + Math.random(), name: file.name, size: file.size, data: ev.target.result, date: new Date().toLocaleDateString("ko-KR") }]);
      r.readAsDataURL(file);
    });
    e.target.value = "";
  };
  const downloadFile = (f) => { const a = document.createElement("a"); a.href = f.data; a.download = f.name; a.click(); };

  const grouped = CAT_ORDER.map(c => ({ category: c, ...CAT_META[c], items: products.filter(p => p.category === c) }));
  const tabList = [
    { key: "notice", icon: "📣", label: "공지사항" },
    { key: "incentive", icon: "🎁", label: "인센티브" },
    { key: "todo", icon: "✅", label: "할 일" },
    { key: "edu", icon: "📚", label: "교육자료" },
  ];

  /* ─── 파일 뷰어가 열려있으면 전체화면 뷰어 표시 ─── */
  if (viewingFile) {
    return (
      <>
        <style>{STYLES}</style>
        <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="yb">
        {/* 헤더 */}
        <header className="yb-hd">
          <div className="yb-hd-in">
            {logoUrl ? (
              <label style={{ cursor: "pointer" }}>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                <img src={logoUrl} alt="로고" className="yb-logo" />
              </label>
            ) : (
              <label className="yb-logo-ph">
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                <span style={{ fontSize: 22 }}>🏠</span>
                <span>로고</span>
              </label>
            )}
            <div className="yb-hd-txt">
              <h1>직원 공유 워크스페이스</h1>
              <p>{formatDate(new Date())}</p>
            </div>
          </div>
        </header>

        <nav className="yb-tabs">
          {tabList.map(t => (
            <button key={t.key} className={`yb-tab-btn ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        <div className="yb-body">
          <div className="yb-card">

            {/* ═══ 공지사항 ═══ */}
            {tab === "notice" && (
              <>
                <div className="yb-sh">
                  <div className="yb-sh-left"><span className="yb-sh-icon">📣</span><span className="yb-sh-title">공지사항</span></div>
                  <span className="yb-sh-badge">{notices.length}건</span>
                </div>
                <div className="yb-n-cats">
                  {NOTICE_CATS.map(c => (
                    <button key={c.key} className={`yb-n-cat ${noticeCat === c.key ? "on" : ""}`}
                      style={noticeCat === c.key ? { background: c.bg, color: c.color, borderColor: c.color } : {}}
                      onClick={() => setNoticeCat(c.key)}>{c.key}</button>
                  ))}
                </div>
                <div className="yb-n-input-row">
                  <input className="yb-input" placeholder="공지사항 내용을 입력하세요..." value={newNotice}
                    onChange={e => setNewNotice(e.target.value)} onKeyDown={e => e.key === "Enter" && addNotice()} />
                  <button className="yb-btn" onClick={addNotice}>추가</button>
                </div>
                {notices.length === 0 ? (
                  <div className="yb-empty"><div className="yb-empty-icon">📋</div><div className="yb-empty-text">아직 등록된 공지사항이 없어요.<br />카테고리를 선택하고 추가해보세요!</div></div>
                ) : (
                  <div className="yb-n-list">
                    {notices.map(n => {
                      const meta = NOTICE_CATS.find(c => c.key === n.cat) || NOTICE_CATS[1];
                      return (
                        <div key={n.id} className="yb-n-item">
                          <div className="yb-n-dot" style={{ background: meta.color }} />
                          <div className="yb-n-body">
                            <span className="yb-n-cat-tag" style={{ background: meta.bg, color: meta.color }}>{n.cat}</span>
                            <div className="yb-n-text">{n.text}</div>
                            <div className="yb-n-date">{n.date}</div>
                          </div>
                          <button className="yb-del-btn" onClick={() => setNotices(p => p.filter(x => x.id !== n.id))}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ═══ 인센티브 ═══ */}
            {tab === "incentive" && (
              <>
                <div className="yb-sh">
                  <div className="yb-sh-left"><span className="yb-sh-icon">🎁</span><span className="yb-sh-title">인센티브 제품 목록</span></div>
                  <span className="yb-sh-badge">{products.length}종</span>
                </div>
                <div className="yb-i-toolbar">
                  <div className="yb-cat-tabs">
                    {grouped.map(g => (
                      <span key={g.category} className="yb-cat-tab" style={{ color: g.color, borderColor: g.border, background: g.bg }}>{g.label}</span>
                    ))}
                  </div>
                  <button className="yb-btn-outline" onClick={openAddModal}>+ 제품 추가</button>
                </div>
                {grouped.map(g => g.items.length > 0 && (
                  <div key={g.category} style={{ marginBottom: 20 }}>
                    <div className="yb-i-grid">
                      {g.items.map(item => (
                        <div key={item.id} className="yb-i-card">
                          <div className="yb-i-actions">
                            <button className="yb-i-act-btn" title="수정" onClick={() => openEditModal(item)}>✎</button>
                            <button className="yb-i-act-btn" title="삭제" onClick={() => removeProduct(item.id)}>✕</button>
                          </div>
                          <div className="yb-i-img-wrap">
                            {productImages[item.id] ? (
                              <>
                                <img src={productImages[item.id]} alt={item.name} className="yb-i-img" />
                                <label className="yb-i-img-change">
                                  <input type="file" accept="image/*" onChange={e => handleImgUpload(item.id, e)} style={{ display: "none" }} />변경
                                </label>
                              </>
                            ) : (
                              <label className="yb-i-img-ph">
                                <input type="file" accept="image/*" onChange={e => handleImgUpload(item.id, e)} style={{ display: "none" }} />
                                <span style={{ fontSize: 28 }}>📷</span><span style={{ fontSize: 11 }}>사진 업로드</span>
                              </label>
                            )}
                          </div>
                          <div className="yb-i-body" onClick={() => openEditModal(item)} style={{ cursor: "pointer" }}>
                            <div className="yb-i-brand">{item.brand}</div>
                            <div className="yb-i-name">{item.name}</div>
                            <div className="yb-i-bottom">
                              <span className="yb-i-amount" style={{ color: g.color }}>₩{item.amount.toLocaleString()}</span>
                              <span className="yb-i-type">{item.type}·{item.source}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {modal && (
                  <div className="yb-modal-bg" onClick={closeModal}>
                    <div className="yb-modal" onClick={e => e.stopPropagation()}>
                      <h3>{modal.mode === "add" ? "🎁 제품 추가" : "✏️ 제품 수정"}</h3>
                      <div className="yb-modal-row"><label>브랜드명</label><input placeholder="예: INGLESINA" value={modalForm.brand} onChange={e => setModalForm(p => ({ ...p, brand: e.target.value }))} /></div>
                      <div className="yb-modal-row"><label>제품명</label><input placeholder="예: 앱티카" value={modalForm.name} onChange={e => setModalForm(p => ({ ...p, name: e.target.value }))} /></div>
                      <div className="yb-modal-row"><label>인센티브 금액 (원)</label><input type="number" placeholder="예: 20000" value={modalForm.amount} onChange={e => setModalForm(p => ({ ...p, amount: e.target.value }))} /></div>
                      <div className="yb-modal-row"><label>지급 유형</label>
                        <select value={modalForm.category} onChange={e => setModalForm(p => ({ ...p, category: e.target.value }))}>
                          <option value="현금브랜드">현금 · 브랜드 지급</option>
                          <option value="상품권브랜드">상품권 · 브랜드 지급</option>
                          <option value="현금매장">현금 · 매장 지급</option>
                        </select>
                      </div>
                      <div className="yb-modal-actions">
                        <button className="yb-btn-outline" onClick={closeModal}>취소</button>
                        <button className="yb-btn" onClick={saveModal}>{modal.mode === "add" ? "추가" : "저장"}</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ═══ 할 일 ═══ */}
            {tab === "todo" && (
              <>
                <div className="yb-sh">
                  <div className="yb-sh-left"><span className="yb-sh-icon">✅</span><span className="yb-sh-title">할 일 목록</span></div>
                  <span className="yb-sh-badge">{dayTodos.length}개</span>
                </div>
                <div className="yb-t-top">
                  <input type="date" className="yb-t-dateinput" value={toKey(selectedDate)}
                    onChange={e => { const d = new Date(e.target.value + "T00:00:00"); if (!isNaN(d)) setSelectedDate(d); }} />
                  {!isToday && <button className="yb-t-today" onClick={() => setSelectedDate(new Date())}>오늘로</button>}
                </div>
                <div className="yb-t-input-row">
                  <input className="yb-input" placeholder="새 할 일을 입력하세요..." value={newTodo}
                    onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} />
                  <button className="yb-btn" onClick={addTodo}>추가</button>
                </div>
                {dayTodos.length === 0 ? (
                  <div className="yb-empty"><div className="yb-empty-icon">📋</div><div className="yb-empty-text">아직 등록된 할 일이 없어요.<br />날짜를 선택하고 추가해보세요!</div></div>
                ) : (
                  <div className="yb-t-list">
                    {dayTodos.map(t => (
                      <div key={t.id} className="yb-t-item">
                        <div className={`yb-t-check ${t.done ? "done" : ""}`} onClick={() => toggleTodo(t.id)}>
                          {t.done && <span className="yb-t-check-mark">✓</span>}
                        </div>
                        <span className="yb-t-text" style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "#bbb" : "#333" }}>{t.text}</span>
                        <button className="yb-t-del" onClick={() => removeTodo(t.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ═══ 교육자료 ═══ */}
            {tab === "edu" && (
              <>
                <div className="yb-sh">
                  <div className="yb-sh-left"><span className="yb-sh-icon">📚</span><span className="yb-sh-title">교육자료</span></div>
                  <span className="yb-sh-badge">{eduFiles.length}개</span>
                </div>
                <label className="yb-e-upload">
                  <input type="file" multiple onChange={handleEduUpload} style={{ display: "none" }} />
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>클릭하여 파일 업로드</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>PDF, 문서, 이미지, 영상, 음성 등</div>
                </label>
                {eduFiles.length === 0 ? (
                  <div className="yb-empty"><div className="yb-empty-icon">📂</div><div className="yb-empty-text">아직 등록된 교육자료가 없어요.<br />파일을 업로드해보세요!</div></div>
                ) : (
                  <div className="yb-e-list">
                    {eduFiles.map(f => {
                      const ft = getFileType(f.name);
                      const canPreview = ft !== "other";
                      return (
                        <div key={f.id} className={`yb-e-item ${canPreview ? "clickable" : ""}`}
                          onClick={canPreview ? () => setViewingFile(f) : undefined}>
                          <span className="yb-e-icon">{getIcon(f.name)}</span>
                          <div className="yb-e-info">
                            <div className="yb-e-name">{f.name}</div>
                            <div className="yb-e-meta">
                              {fmtSize(f.size)} · {f.date}
                              {canPreview && <span className="yb-e-preview-tag">미리보기 가능</span>}
                            </div>
                          </div>
                          <div className="yb-e-actions" onClick={e => e.stopPropagation()}>
                            <button className="yb-e-dl" onClick={() => downloadFile(f)}>받기</button>
                            <button className="yb-del-btn" onClick={() => setEduFiles(p => p.filter(x => x.id !== f.id))}>✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>
        </div>
        <footer className="yb-footer">양주베이비하우스 · 직원 업무 관리 시스템</footer>
      </div>
    </>
  );
}

/* ─── 스타일 (변수로 분리해서 깔끔하게) ─── */
const STYLES = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#f5f0eb;overflow-x:hidden;}

.yb{font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;min-height:100vh;background:#f5f0eb;color:#1e293b;overflow-x:hidden;}
.yb-hd{background:#2c2c2c;padding:20px 24px;color:#fff;}
.yb-hd-in{max-width:800px;margin:0 auto;display:flex;align-items:center;gap:16px;}
.yb-logo{width:56px;height:56px;border-radius:10px;object-fit:contain;cursor:pointer;}
.yb-logo-ph{width:56px;height:56px;border-radius:10px;background:rgba(255,255,255,0.1);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:#aaa;border:2px dashed rgba(255,255,255,0.3);font-size:10px;gap:2px;}
.yb-hd-txt h1{font-size:15px;font-weight:500;color:#ccc;letter-spacing:0.5px;}
.yb-hd-txt p{font-size:13px;color:#999;margin-top:2px;}

.yb-tabs{max-width:800px;margin:0 auto;display:flex;border-bottom:2px solid #e0d5c9;padding:0 16px;}
.yb-tab-btn{flex:1;padding:14px 8px;border:none;background:transparent;font-size:14px;font-weight:600;cursor:pointer;color:#999;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;position:relative;transition:color 0.2s;}
.yb-tab-btn.on{color:#c0392b;}
.yb-tab-btn.on::after{content:'';position:absolute;bottom:-2px;left:10%;right:10%;height:3px;background:#c0392b;border-radius:2px;}

.yb-body{max-width:800px;margin:20px auto 0;padding:0 16px 40px;}
.yb-card{background:#fff;border-radius:12px;box-shadow:0 1px 8px rgba(0,0,0,0.06);padding:24px;overflow:hidden;}

.yb-sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.yb-sh-left{display:flex;align-items:center;gap:10px;}
.yb-sh-icon{font-size:22px;}
.yb-sh-title{font-size:18px;font-weight:700;}
.yb-sh-badge{font-size:12px;background:#f1ece7;color:#8b7355;padding:3px 12px;border-radius:20px;font-weight:600;}

.yb-n-cats{display:flex;gap:4px;margin-bottom:12px;}
.yb-n-cat{padding:5px 14px;border-radius:20px;border:1.5px solid #ddd;font-size:12px;font-weight:600;cursor:pointer;background:#fff;font-family:inherit;transition:all 0.15s;}
.yb-n-cat.on{border-color:currentColor;}
.yb-n-input-row{display:flex;gap:8px;margin-bottom:20px;}
.yb-n-list{display:flex;flex-direction:column;}
.yb-n-item{display:flex;align-items:flex-start;gap:12px;padding:18px 0;border-bottom:1px solid #f0ebe5;}
.yb-n-item:last-child{border-bottom:none;}
.yb-n-dot{width:8px;height:8px;border-radius:50%;margin-top:7px;flex-shrink:0;}
.yb-n-body{flex:1;min-width:0;}
.yb-n-cat-tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-bottom:4px;}
.yb-n-text{font-size:14px;line-height:1.65;font-weight:500;color:#333;word-break:break-word;}
.yb-n-date{font-size:12px;color:#aaa;margin-top:4px;}

.yb-i-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;}
.yb-cat-tabs{display:flex;gap:6px;flex-wrap:wrap;}
.yb-cat-tab{padding:5px 14px;border-radius:6px;font-size:12px;font-weight:700;border:1.5px solid;cursor:default;}
.yb-i-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
.yb-i-card{border:1px solid #e8e0d6;border-radius:10px;overflow:hidden;background:#fff;position:relative;transition:box-shadow 0.2s;}
.yb-i-card:hover{box-shadow:0 3px 12px rgba(0,0,0,0.08);}
.yb-i-img-wrap{width:100%;aspect-ratio:1/1;background:#f8f4f0;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.yb-i-img{width:100%;height:100%;object-fit:cover;}
.yb-i-img-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;width:100%;height:100%;gap:4px;color:#bbb;}
.yb-i-img-change{position:absolute;bottom:6px;right:6px;font-size:10px;background:rgba(0,0,0,0.55);color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;}
.yb-i-actions{position:absolute;top:6px;right:6px;display:flex;gap:4px;opacity:0;transition:opacity 0.2s;z-index:2;}
.yb-i-card:hover .yb-i-actions{opacity:1;}
.yb-i-act-btn{width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.45);color:#fff;border:none;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.yb-i-body{padding:10px 12px 14px;}
.yb-i-brand{font-size:10px;color:#999;font-weight:600;letter-spacing:0.5px;margin-bottom:2px;}
.yb-i-name{font-size:14px;font-weight:700;color:#333;margin-bottom:6px;}
.yb-i-bottom{display:flex;align-items:center;justify-content:space-between;}
.yb-i-amount{font-size:16px;font-weight:800;}
.yb-i-type{font-size:10px;color:#aaa;font-weight:600;}

.yb-t-top{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.yb-t-dateinput{padding:8px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;color:#333;outline:none;}
.yb-t-dateinput:focus{border-color:#c0392b;}
.yb-t-today{padding:8px 16px;border:1.5px solid #ddd;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;color:#666;font-family:inherit;}
.yb-t-input-row{display:flex;gap:8px;margin-bottom:16px;}
.yb-t-list{display:flex;flex-direction:column;}
.yb-t-item{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #f0ebe5;}
.yb-t-item:last-child{border-bottom:none;}
.yb-t-check{width:20px;height:20px;border-radius:5px;border:2px solid #ccc;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all 0.15s;background:#fff;}
.yb-t-check.done{background:#c0392b;border-color:#c0392b;}
.yb-t-check-mark{color:#fff;font-size:12px;font-weight:700;}
.yb-t-text{font-size:14px;font-weight:500;flex:1;transition:all 0.2s;}
.yb-t-del{background:none;border:none;color:#ccc;font-size:16px;cursor:pointer;padding:2px 6px;}
.yb-t-del:hover{color:#e74c3c;}

.yb-e-upload{display:block;border:2px dashed #ccc;border-radius:12px;padding:30px 20px;text-align:center;cursor:pointer;transition:all 0.2s;margin-bottom:20px;background:#faf8f5;width:100%;}
.yb-e-upload:hover{border-color:#c0392b;background:#fef7f5;}
.yb-e-list{display:flex;flex-direction:column;gap:8px;width:100%;}
.yb-e-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#faf8f5;border-radius:10px;border:1px solid #e8e0d6;width:100%;transition:all 0.15s;}
.yb-e-item.clickable{cursor:pointer;}
.yb-e-item.clickable:hover{background:#f0ebe5;border-color:#d5cdc3;}
.yb-e-icon{font-size:26px;flex-shrink:0;}
.yb-e-info{flex:1;min-width:0;overflow:hidden;}
.yb-e-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.yb-e-meta{font-size:11px;color:#aaa;margin-top:2px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.yb-e-preview-tag{font-size:10px;color:#c0392b;font-weight:600;background:#fef2f2;padding:1px 6px;border-radius:3px;}
.yb-e-actions{display:flex;gap:6px;flex-shrink:0;}
.yb-e-dl{background:#fff;border:1px solid #ddd;color:#555;font-size:11px;padding:5px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-weight:600;}
.yb-e-dl:hover{background:#f5f0eb;}

.yb-empty{text-align:center;padding:50px 20px;color:#bbb;}
.yb-empty-icon{font-size:40px;margin-bottom:10px;}
.yb-empty-text{font-size:14px;line-height:1.6;}

.yb-input{flex:1;padding:10px 14px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;font-family:inherit;min-width:0;}
.yb-input:focus{border-color:#c0392b;}
.yb-btn{padding:10px 20px;background:#c0392b;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
.yb-btn:active{transform:scale(0.97);}
.yb-btn-outline{padding:9px 16px;background:#fff;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
.yb-del-btn{background:none;border:none;color:#ccc;font-size:16px;cursor:pointer;padding:2px 6px;flex-shrink:0;}
.yb-del-btn:hover{color:#e74c3c;}

.yb-modal-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;}
.yb-modal{background:#fff;border-radius:14px;padding:24px;width:100%;max-width:420px;box-shadow:0 8px 30px rgba(0,0,0,0.15);}
.yb-modal h3{font-size:17px;font-weight:700;margin-bottom:18px;}
.yb-modal-row{margin-bottom:12px;}
.yb-modal-row label{display:block;font-size:12px;font-weight:600;color:#666;margin-bottom:4px;}
.yb-modal-row input,.yb-modal-row select{width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;}
.yb-modal-row input:focus,.yb-modal-row select:focus{border-color:#c0392b;}
.yb-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px;}

.yb-footer{text-align:center;padding:16px 0 28px;font-size:11px;color:#bbb;max-width:800px;margin:0 auto;}

/* ═══ 파일 뷰어 ═══ */
.fv-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:#1a1a1a;z-index:200;display:flex;flex-direction:column;font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;}
.fv-header{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#2c2c2c;color:#fff;gap:12px;flex-shrink:0;}
.fv-back{background:none;border:1px solid rgba(255,255,255,0.2);color:#fff;padding:7px 14px;border-radius:8px;font-size:13px;cursor:pointer;font-family:inherit;font-weight:600;white-space:nowrap;}
.fv-back:hover{background:rgba(255,255,255,0.1);}
.fv-title-area{display:flex;align-items:center;gap:10px;flex:1;min-width:0;}
.fv-icon{font-size:24px;flex-shrink:0;}
.fv-filename{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fv-filemeta{font-size:11px;color:#999;margin-top:1px;}
.fv-dl-btn{background:#c0392b;border:none;color:#fff;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
.fv-body{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;padding:20px;}

.fv-image-wrap{max-width:100%;max-height:100%;display:flex;align-items:center;justify-content:center;}
.fv-image{max-width:100%;max-height:calc(100vh - 120px);object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);}

.fv-video-wrap{width:100%;max-width:900px;}
.fv-video{width:100%;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);}

.fv-audio-wrap{text-align:center;padding:40px;}
.fv-audio-icon{font-size:64px;margin-bottom:16px;}
.fv-audio-name{font-size:16px;font-weight:600;color:#fff;margin-bottom:24px;}

.fv-pdf-wrap{width:100%;height:100%;max-width:900px;}
.fv-pdf{width:100%;height:100%;border:none;border-radius:8px;background:#fff;}

.fv-text-wrap{width:100%;max-width:800px;max-height:100%;overflow:auto;background:#2d2d2d;border-radius:10px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.3);}
.fv-text{color:#e0e0e0;font-size:13px;line-height:1.7;font-family:'SF Mono','Consolas','Menlo',monospace;white-space:pre-wrap;word-break:break-word;margin:0;}

.fv-other{text-align:center;color:#fff;padding:40px;}

@media(max-width:640px){
  .yb-hd{padding:16px;}
  .yb-logo,.yb-logo-ph{width:44px;height:44px;}
  .yb-hd-txt h1{font-size:13px;}
  .yb-tabs{padding:0 8px;}
  .yb-tab-btn{font-size:12px;padding:12px 4px;gap:3px;}
  .yb-body{padding:0 8px 32px;margin-top:14px;}
  .yb-card{padding:18px 14px;}
  .yb-sh-title{font-size:16px;}
  .yb-i-grid{grid-template-columns:repeat(2,1fr);gap:8px;}
  .yb-i-actions{opacity:1;}
  .yb-n-input-row{flex-direction:column;}
  .yb-t-top{gap:6px;}
  .yb-t-dateinput{font-size:13px;padding:7px 10px;}
  .yb-t-today{font-size:12px;padding:7px 12px;}
  .yb-t-input-row{flex-direction:column;}
  .yb-e-item{padding:10px 12px;gap:8px;}
  .fv-header{padding:10px 14px;gap:8px;}
  .fv-back{padding:6px 10px;font-size:12px;}
  .fv-dl-btn{padding:6px 12px;font-size:12px;}
  .fv-filename{font-size:12px;}
  .fv-body{padding:10px;}
}
@media(max-width:380px){
  .yb-i-grid{grid-template-columns:repeat(2,1fr);gap:6px;}
  .yb-tab-btn{font-size:11px;}
}
`;
