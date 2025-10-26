import React, { useEffect, useState, useRef } from "react";

/** QhaliKiosk – Portrait 1080×1920
 * - i18n ES/QU
 * - Flujo: Prechecks → DNI → Temperatura → SPO2 → ECG → Resultados → Envío → Impresión → Felicidades
 * - Sonidos WebAudio
 * - Simulación de signos + ganchos WS
 * - Layout full HD con contenido centrado
 * - Gamepad: botón 0 = Continuar, botón 1 = Retroceder (y Enter/Esc como respaldo)
 */

// ====== Tema / Layout
const THEME = {
  frameW: 1080,
  frameH: 1920,
  bg: "#FFFFFF",
  sky: "#A5DBE9",
  blue: "#2E6FD8",
  blueDark: "#2158AD",
  text: "#1F3344",
  muted: "#5F7C8C",
  ring: "#1FB197",
};

// ====== i18n
const I18N = {
  es: {
    langName: "Español",
    ok: "OK", back: "Retroceder", continuar: "Continuar",
    choose_title: "KHALI\nQIOSK",
    choose_sub: "Elige tu idioma\nSimiykita akllay",
    es: "Español", qu: "Quechua",

    pre_title: "ANTES DE\nEMPEZAR", pre_sub: "ASEGÚRATE QUE:",
    pre_a1: "No hayas tomado\nbebidas\nalcohólicas",
    pre_a2: "El botón magenta\nes para reiniciar\ndesde cero",
    pre_b1: "Estás en\nayuno", pre_b2: "No estás\nembarazada",

    dni_title: "POR FAVOR,\nINGRESE SU DNI:",
    borrar: "Borrar", listo: "Listo",

    temp_title: "MEDICIÓN DE\nTEMPERATURA",
    temp_instr: "Coloque su mentón arriba del\ndispensador, como en la\nsiguiente imagen:",
    medir: "¡A medir!", repeat: "Repetir instrucción",
    here: "¡AQUÍ\nVAMOS!", ready: "Prepárate para la\nmedición...",
    midiendo: "¡MIDIENDO!", quieto: "Por favor, manténgase\nen su sitio..",
    done_title: "¡MEDICIÓN\nCOMPLETADA!", done_sub: "¡Estás en la mitad del\nproceso!",
    temperatura: "Temperatura",
    fail_title: "¡ALGO SALIÓ\nMAL!",
    fail_sub: "Uy, la medición no salió\ncomo debería, si quieres\nla podemos repetir...",

    // SPO2
    spo2_title: "MEDICIÓN DE\nSPO2",
    spo2_instr: "Coloque su dedo en el\ncuadro plateado, como en el\nsiguiente video:",
    spo2_res_label: "Saturación de oxígeno",

    // ECG
    ecg_title: "MEDICIÓN\nFINAL",
    ecg_1: "Saque dos electrodos del\ndispensador, por favor.",
    ecg_2: "Retire todos los stickers y\npegue un electrodo en la\nsiguiente ubicación:",
    ecg_3: "Repetir lo mismo con el\notro brazo, usar esta\nubicación:",
    ecg_4: "Colocar sus antebrazos en\nla rendija y conectar los\nelectrodos:",
    medir_ecg: "¡A medir!",

    resultados_title: "DATOS PERSONALES",
    dni_label: "DNI:",
    obtenidos_title: "DATOS OBTENIDOS",
    enviando: "LA INFORMACIÓN\nSE ESTÁ ENVIANDO\nAL MINSA..",
    imprimiendo: "IMPRIMIENDO\nDATOS...",
    felicidades: "¡FELICIDADES!",
    felicidades_msg:
      "¡Te has realizado un triaje completamente gratuito!\n\n¡No se olvide de regresar el XX/XX/XXXX para\npoder revisar su salud!",
    finalizar: "Finalizar",
  },
  qu: {
    langName: "Qhichwa",
    ok: "OK", back: "Kutiy", continuar: "Ñawpaqman",
    choose_title: "KHALI\nQIOSK", choose_sub: "Simiykita akllay",
    es: "Español", qu: "Quechua",

    pre_title: "QALLARINAPAQ", pre_sub: "Kayniykita qhawariy:",
    pre_a1: "Aqham upyaspalla\nmana kachun",
    pre_a2: "Botón magenta\nqallarimuykita kutichin",
    pre_b1: "Ayunopi kachkanki", pre_b2: "Mana wawancha-\nwan kachkanki",

    dni_title: "DNI yaykuchiy:", borrar: "Qichuy", listo: "Tukuy",

    temp_title: "Temperaturata\nruwaspa",
    temp_instr: "Kunkayki dispenserpi\nwichk'ay, kay imagenhina:",
    medir: "Ruwachiy!", repeat: "Kutichiy willakuy",
    here: "Chayqa!", ready: "Ruwakuypaq\npreparakuy...",
    midiendo: "Qhantichkaptin", quieto: "Ama kuyuchikuychu",
    done_title: "Tukukusqa\nmedición!", done_sub: "Chawpipiñam kachkanki",
    temperatura: "Temperatura",
    fail_title: "Imapas\npantasqa!", fail_sub: "Mana allin ruwasqa,\nmaypipas kutichisunchis…",

    // SPO2
    spo2_title: "SPO2 ruwanapaq",
    spo2_instr: "Ruk'uykita plateadopi\nchuray, kay videohina:",
    spo2_res_label: "Q'aspisqa q'atasqa (% SPO2)",

    ecg_title: "Qhipa ruwana",
    ecg_1: "Isqon electrodokuna\nchaskiy dispensermanta",
    ecg_2: "Stickerkunata qichuy\nchaypi churay",
    ecg_3: "Huk makipi hina\nruwaspa churay",
    ecg_4: "Makiykikunata t'aqman\nchuray, ch'askikunawan tink'uy",
    medir_ecg: "Ruwachiy!",

    resultados_title: "RUNA WILLAY",
    dni_label: "DNI:",
    obtenidos_title: "RURASQAKUNA",
    enviando: "MINSAman apachispa\nkachkan...",
    imprimiendo: "Qelqaq willakuyta\nñit'ispa...",
    felicidades: "Sumaqmi!",
    felicidades_msg:
      "Qhilaykita ruwasqanki!\nHamuq punchaw qutiy\nqhawapaypaq.",
    finalizar: "Tukuy",
  },
};

// ====== Estados
const S = {
  LANG: "LANG", PRE1: "PRE1", PRE2: "PRE2",
  DNI: "DNI",

  TEMP_INFO: "TEMP_INFO", TEMP_READY: "TEMP_READY", TEMP_MEAS: "TEMP_MEAS",
  TEMP_DONE: "TEMP_DONE", TEMP_FAIL: "TEMP_FAIL",

  // SPO2
  SPO2_INFO: "SPO2_INFO", SPO2_READY: "SPO2_READY", SPO2_MEAS: "SPO2_MEAS",
  SPO2_DONE: "SPO2_DONE", SPO2_FAIL: "SPO2_FAIL",

  ECG_1: "ECG_1", ECG_2: "ECG_2", ECG_3: "ECG_3", ECG_4: "ECG_4",
  ECG_READY: "ECG_READY", ECG_MEAS: "ECG_MEAS", ECG_DONE: "ECG_DONE",

  RESULTS: "RESULTS", SENDING: "SENDING", PRINTING: "PRINTING", CONGRATS: "CONGRATS",
};

// ====== Config medición / integración
const TEMP_MIN_OK = 35.0;
const TEMP_MAX_OK = 42.0;
const SPO2_MIN_OK = 90; // umbral simple demo

// WebSocket (activa USE_WS=true y ajusta URL cuando conectes XSpace)
const USE_WS = false;
const WS_URL = "ws://localhost:9000/vitals";

// ====== Sonidos (WebAudio)
function playTone({ freq = 880, ms = 120, vol = 0.15 } = {}) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = "sine"; osc.frequency.value = freq; gain.gain.value = vol;
  osc.start();
  setTimeout(() => { try { osc.stop(); ctx.close(); } catch {} }, ms);
}
const SFX = {
  click:   () => playTone({ freq: 520, ms: 100 }),
  start:   () => playTone({ freq: 780, ms: 150 }),
  success: () => { playTone({ freq: 740, ms: 80 }); setTimeout(() => playTone({ freq: 980, ms: 120 }), 90); },
  error:   () => { playTone({ freq: 300, ms: 140 }); setTimeout(() => playTone({ freq: 220, ms: 180 }), 140); },
};

// ====== Utilidades
function useScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const onResize = () => {
      const s = Math.min(
        window.innerWidth / THEME.frameW,
        window.innerHeight / THEME.frameH
      );
      setScale(s);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
}
function simulateVitals(seed = 0) {
  const r = (a, b) => a + ((Math.sin(seed++) + 1) / 2) * (b - a);
  return {
    hr: Math.round(r(70, 86)),
    spo2: Math.round(r(97, 99)),
    temp: +r(36.3, 36.9).toFixed(1),
    rr: Math.round(r(12, 18)),
    sbp: Math.round(r(110, 125)),
    dbp: Math.round(r(70, 84)),
  };
}
function useVitalsWS() {
  const [v, setV] = useState(null);
  useEffect(() => {
    if (!USE_WS) return;
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (e) => { try { setV(JSON.parse(e.data)); } catch {} };
    return () => ws.close();
  }, []);
  return v;
}
async function sendToCloudMock(payload) {
  await new Promise((r) => setTimeout(r, 900)); // simulación
  return { ok: true };
}

/* ===== Gamepad Hook =====
 * Botón 0 = aceptar/continuar
 * Botón 1 = retroceder
 * D-Pad (12–15) u eje 0 para izquierda/derecha (opcional)
 */
function useGamepad({ onConfirm, onBack, onLeft, onRight }) {
  const prevButtons = useRef([]);
  const connected = useRef(false);

  useEffect(() => {
    let rafId;

    const read = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = pads && pads[0];
      if (gp) {
        connected.current = true;
        // botones (con flanco de subida)
        const b = gp.buttons || [];
        const get = (i) => (b[i] && b[i].pressed) ? 1 : 0;
        const was = (i) => prevButtons.current[i] ? 1 : 0;

        const press = (i, cb) => {
          if (get(i) && !was(i) && cb) cb();
        };

        // confirmar/back
        press(0, onConfirm);
        press(1, onBack);

        // D-Pad
        press(14, onLeft);  // left
        press(15, onRight); // right

        // Algunos joysticks reportan ejes para el d-pad
        const ax0 = gp.axes && gp.axes.length ? gp.axes[0] : 0;
        if (typeof ax0 === "number") {
          if (ax0 < -0.6) { if (!was(100)) { onLeft && onLeft(); prevButtons.current[100] = 1; } }
          else if (ax0 > 0.6) { if (!was(101)) { onRight && onRight(); prevButtons.current[101] = 1; } }
          else { prevButtons.current[100] = 0; prevButtons.current[101] = 0; }
        }

        prevButtons.current = b.map(btn => (btn && btn.pressed) ? 1 : 0);
      }
      rafId = requestAnimationFrame(read);
    };

    const start = () => { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(read); };
    const stop = () => { cancelAnimationFrame(rafId); };

    window.addEventListener("gamepadconnected", start);
    window.addEventListener("gamepaddisconnected", stop);
    start();

    // Respaldo: teclas
    const onKey = (e) => {
      if (e.key === "Enter") onConfirm && onConfirm();
      if (e.key === "Escape" || e.key === "Backspace") onBack && onBack();
      if (e.key === "ArrowLeft") onLeft && onLeft();
      if (e.key === "ArrowRight") onRight && onRight();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      stop();
      window.removeEventListener("gamepadconnected", start);
      window.removeEventListener("gamepaddisconnected", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, [onConfirm, onBack, onLeft, onRight]);
}

// ====== Media reusable
function MediaBlock({ type = "video", src, alt = "", height = 240 }) {
  if (!src) return (
    <div style={{
      margin: "0 auto", width: "100%", maxWidth: 720, height,
      borderRadius: 12, background: "#F1F5F9",
      color: "#64748B", display: "grid", placeItems: "center",
      border: "1px solid #E2E8F0"
    }}>
      (sin recurso)
    </div>
  );

  if (type === "image")
    return (
      <img
        src={src}
        alt={alt}
        style={{ margin: "0 auto", borderRadius: 12, maxHeight: height, width: "100%", maxWidth: 720, display: "block" }}
      />
    );

  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      style={{ margin: "0 auto", borderRadius: 12, maxHeight: height, width: "100%", maxWidth: 720, display: "block" }}
    />
  );
}

// ====== Átomos UI
const H1 = ({ children }) => (
  <div style={{ whiteSpace: "pre-line", textAlign: "center", color: THEME.blue, fontWeight: 900, fontSize: 84, lineHeight: 1.02 }}>{children}</div>
);
const H2 = ({ children }) => (
  <div style={{ whiteSpace: "pre-line", textAlign: "center", color: THEME.blue, fontWeight: 900, fontSize: 56, lineHeight: 1.08 }}>{children}</div>
);
const P = ({ children, center = false }) => (
  <div style={{ whiteSpace: "pre-line", color: THEME.muted, fontSize: 30, lineHeight: 1.28, textAlign: center ? "center" : "left" }}>{children}</div>
);
const BtnPrimary = ({ children, onClick, wide, selected }) => (
  <button onClick={() => { SFX.click(); onClick && onClick(); }} style={{
    width: wide ? "100%" : undefined,
    background: selected ? THEME.blue : "#B7E5F4", // activo o inactivo
    color: selected ? "#fff" : THEME.blueDark,
    border: `5px solid ${THEME.sky}`, borderRadius: 999,
    fontWeight: 900, fontSize: 32, padding: "16px 28px",
    transition: "all 0.15s ease",
  }}>{children}</button>
);
const BtnSolid = ({ children, onClick, wide, selected }) => (
  <button onClick={() => { SFX.click(); onClick && onClick(); }} style={{
    width: wide ? "100%" : undefined,
    background: selected ? THEME.blueDark : "#B7E5F4",
    color: selected ? "#fff" :THEME.text,
    borderRadius: 999, fontWeight: 800, fontSize: 32, padding: "18px 28px",
    transition: "all 0.15s ease",
  }}>{children}</button>
);
// “Card”
const Card = ({ children }) => (<div style={{ width: "100%", padding: 0 }}>{children}</div>);

// ====== Frame 1080×1920 (UI centrada entre franjas)
const Frame = ({ children }) => {
  const scale = useScale();
  return (
    <div style={{ width: "100vw", height: "100vh", background: THEME.bg, display: "grid", placeItems: "center", overflow: "hidden" }}>
      <div style={{ width: THEME.frameW, height: THEME.frameH, transform: `scale(${scale})`, transformOrigin: "top left", position: "relative", background: "#fff" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 48, background: THEME.sky }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: THEME.sky }} />

        {/* Área útil centrada vertical y horizontalmente */}
        <div
          style={{
            position: "absolute",
            inset: "48px 0 48px 0",
            padding: "24px 48px",
            height: "calc(100% - 96px)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// ====== Pantallas

function LangScreen({ t, lang, setLang, onNext }) {
  const btnEs = useRef(null);
  const btnQu = useRef(null);
  const btnOk = useRef(null);
  const buttons = [btnEs, btnQu, btnOk];

  const focused = useJoystickNavigation(buttons, () => buttons[focused]?.current?.click(), onNext);

  return (
    <Card>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          gap: 24,
          textAlign: "center",
          width: "100%",
          maxWidth: 800,
        }}
      >
        {/* Título */}
        <H1>{t.choose_title}</H1>
        <P center>{t.choose_sub}</P>

        {/* Botones de selección de idioma */}
        <div style={{ display: "grid", gap: 16, width: "100%", marginTop: 16 }}>
          {/* Español */}
          <button
            ref={btnEs}
            onClick={() => setLang("es")}
            style={{
              width: "100%",
              background: focused === 0 ? "#005F9E" : "#66CCFF", // cambio de color
              color: "#fff",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 36,
              padding: "20px 36px",
              border: "none",
              transition: "background 0.2s ease, transform 0.2s",
              transform: focused === 0 ? "scale(1.05)" : "scale(1.0)",
            }}
          >
            Español
          </button>

          {/* Quechua */}
          <button
            ref={btnQu}
            onClick={() => setLang("qu")}
            style={{
              width: "100%",
              background: focused === 1 ? "#005F9E" : "#66CCFF",
              color: "#fff",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 36,
              padding: "20px 36px",
              border: "none",
              transition: "background 0.2s ease, transform 0.2s",
              transform: focused === 1 ? "scale(1.05)" : "scale(1.0)",
            }}
          >
            Quechua
          </button>

          {/* Continuar */}
          <button
            ref={btnOk}
            onClick={() => onNext(S.PRE1)}
            style={{
              width: "100%",
              background: focused === 2 ? "#005F9E" : "#66CCFF",
              color: "#fff",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 36,
              padding: "20px 36px",
              border: "none",
              transition: "background 0.2s ease, transform 0.2s",
              transform: focused === 2 ? "scale(1.05)" : "scale(1.0)",
            }}
          >
            {t.ok}
          </button>
        </div>
      </div>
    </Card>
  );
}


const PreItem = React.forwardRef(({ img, text, active, selected, onClick }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      cursor: "pointer",
      background: selected ? "#E2E8F0" : "transparent",
      borderRadius: 12,
      padding: "8px 12px",
      transition: "0.2s",
    }}
  >
    <MediaBlock type="image" src={img} height={76} />
    <P>{text}</P>
  </div>
));

function Precheck({ t, onNext, onBack }) {
  const [selectedItems, setSelectedItems] = useState([false, false, false]);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const refCont = useRef(null);
  const buttons = [ref1, ref2, ref3, refCont];

  const focused = useJoystickNavigation(
    buttons,
    () => {
      if (focused < 3) {
        setSelectedItems((prev) => prev.map((v, i) => (i === focused ? !v : v)));
      } else {
        onNext();
      }
    },
    onBack
  );

  return (
    <Card>
      <H2 style={{ color: THEME.blue, fontSize: 56, marginBottom: 16 }}>{t.pre_title}</H2>
      <p style={{ fontSize: 24, color: THEME.muted, marginBottom: 32 }}>{t.pre_sub}</p>

      <div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
        <PreItem
          img="/assets/images/No_bebidas.png"
          text={t.pre_a1}
          active={selectedItems[0]}
          selected={focused === 0}
          onClick={() => setSelectedItems((p) => p.map((v, i) => (i === 0 ? !v : v)))}
          ref={ref1}
        />
        <PreItem
          img="/assets/images/Ayuno.png"
          text={t.pre_b1}
          active={selectedItems[1]}
          selected={focused === 1}
          onClick={() => setSelectedItems((p) => p.map((v, i) => (i === 1 ? !v : v)))}
          ref={ref2}
        />
        <PreItem
          img="/assets/images/No_embarazada.png"
          text={t.pre_b2}
          active={selectedItems[2]}
          selected={focused === 2}
          onClick={() => setSelectedItems((p) => p.map((v, i) => (i === 2 ? !v : v)))}
          ref={ref3}
        />
      </div>

      <div style={{ marginTop: 48, maxWidth: 480 }}>
        <BtnSolid ref={refCont} wide onClick={onNext} selected={focused === 3}>
          {t.continuar}
        </BtnSolid>
      </div>
    </Card>
  );
}
     
function DNIScreen({ t, onBack, onDone }) {
  const [dni, setDni] = useState("");
  const press = (d) => setDni((v) => (v + d).slice(0, 8));
  const del = () => setDni((v) => v.slice(0, -1));

  // ===== Refs de TODOS los botones =====
  const numRefs = Array.from({ length: 12 }, () => useRef(null)); // 1–9 + 0
  const delRef = useRef(null);
  const listoRef = useRef(null);
  const backRef = useRef(null);

  const buttons = [...numRefs, delRef, listoRef, backRef];

  // ===== Integrar el joystick =====
  const focused = useJoystickNavigation(buttons, null, onBack);

  return (
    <Card>
      <div style={{ display: "grid", gap: 24 }}>
        <H2>{t.dni_title}</H2>

        {/* Línea de ingreso */}
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: 720,
            height: 74,
            borderRadius: 16,
            border: "4px solid #7FC9E0",
            display: "grid",
            placeItems: "center",
            color: THEME.text,
            fontWeight: 900,
            fontSize: 40,
          }}
        >
          {dni || "—"}
        </div>

        {/* Teclado */}
        <div style={{ display: "grid", placeItems: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {["1","2","3","4","5","6","7","8","9","","0",""].map((n, i) =>
              n ? (
                <button
                  key={i}
                  ref={numRefs[i]}
                  onClick={() => press(n)}
                  style={{
                    height: 86,
                    borderRadius: 16,
                    background: focused === i ? "#2E6FD8" : "#CDECF5",
                    color: focused === i ? "#fff" : THEME.blue,
                    fontWeight: 900,
                    fontSize: 34,
                    transition: "0.15s",
                  }}
                >
                  {n}
                </button>
              ) : (
                <div key={i} />
              )
            )}
          </div>
        </div>

        {/* Acciones */}
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <button
            ref={delRef}
            onClick={del}
            style={{
              background: focused === numRefs.length ? "#D63384" : THEME.blueDark,
              color: "#fff",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "0.15s",
            }}
          >
            {t.borrar}
          </button>

          <button
            ref={listoRef}
            onClick={() => onDone(dni)}
            style={{
              background: focused === numRefs.length + 1 ? "#1FB197" : "#CDECF5",
              color: focused === numRefs.length + 1 ? "#fff" : THEME.blue,
              borderRadius: 999,
              fontWeight: 900,
              fontSize: 32,
              padding: "16px 28px",
              transition: "0.15s",
            }}
          >
            {t.listo}
          </button>
        </div>

        {/* Retroceder */}
        <div style={{ display: "grid", placeItems: "start" }}>
          <div style={{ width: "100%", maxWidth: 720 }}>
            <button
              ref={backRef}
              onClick={onBack}
              style={{
                width: "100%",
                background: focused === numRefs.length + 2 ? THEME.sky : "#fff",
                color: focused === numRefs.length + 2 ? THEME.blueDark : THEME.blue,
                border: `5px solid ${THEME.sky}`,
                borderRadius: 999,
                fontWeight: 900,
                fontSize: 32,
                padding: "16px 28px",
                transition: "0.15s",
              }}
            >
              {t.back}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}       

function TempInfo({ t, onMeasure, onBack }) {
  const btn1 = useRef(null);
  const btn2 = useRef(null);
  const btn3 = useRef(null);
  const buttons = [btn1, btn2, btn3];

  const focused = useJoystickNavigation(buttons, onMeasure, onBack);

  return (
    <Card>
      <div style={{ display: "grid", gap: 16 }}>
        <H2>{t.temp_title}</H2>
        <P center>{t.temp_instr}</P>

        <MediaBlock type="video" src="/assets/videos/Menton.mp4" height={240} />

        <div style={{ display: "grid", gap: 12, marginTop: 8, maxWidth: 720 }}>
          <BtnSolid wide onClick={onMeasure} selected={focused === 0} ref={btn1}>
            {t.medir}
          </BtnSolid>
          <BtnPrimary wide onClick={onBack} selected={focused === 1} ref={btn2}>
            {t.back}
          </BtnPrimary>
          <BtnPrimary
            wide
            onClick={() => alert("Reproducir instrucción")}
            selected={focused === 2}
            ref={btn3}
          >
            {t.repeat}
          </BtnPrimary>
        </div>
      </div>
    </Card>
  );
}


function Countdown({ t, onDone }) {
  const [c, setC] = useState(5); useEffect(() => { if (c <= 0) return void onDone(); const id = setTimeout(() => setC(x => x - 1), 1000); return () => clearTimeout(id); }, [c]);
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
        <H2>{t.here}</H2>
        <P center>{t.ready}</P>
        <div
          style={{
            width: 260, height: 260, borderRadius: "50%",
            border: "22px solid " + THEME.ring, display: "grid", placeItems: "center"
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 900, color: THEME.ring }}>{c}</div>
        </div>
      </div>
    </Card>
  );
}

function TempMeasuring({ t, onBack, onDone, setTemp }) {
  useEffect(() => {
    const id = setTimeout(() => {
      const val = 36.0 + Math.random() * 2.0; // 36.0–38.0
      setTemp(+val.toFixed(1));
      onDone();
    }, 4000);
    return () => clearTimeout(id);
  }, []);
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 24 }}>
        <H2>{t.midiendo}</H2>
        <P center>{t.quieto}</P>
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", height: 26, background: "#CFE6FF", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: "0%", height: "100%", background: THEME.blueDark, animation: "grow 4s linear forwards" }} />
        </div>
        <div style={{ width: "100%", maxWidth: 720 }}>
          <BtnPrimary wide onClick={onBack}>{t.back}</BtnPrimary>
        </div>
      </div>
      <style>{`@keyframes grow { to { width: 100% } }`}</style>
    </Card>
  );
}

function TempDone({ t, temp, onContinue, onBack }) {
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
        <H2>{t.done_title}</H2>
        <P center>{t.done_sub}</P>
        <MediaBlock type="image" src="/assets/images/Carita_feliz.png" height={72} />
        <div style={{ marginTop: 4, color: THEME.muted, fontSize: 26 }}>
          {t.temperatura}: <b style={{ color: THEME.text }}>{temp ?? "—"} °C</b>
        </div>
        <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 720, marginTop: 8 }}>
          <BtnPrimary wide onClick={onContinue}>{t.continuar}</BtnPrimary>
          <BtnSolid   wide onClick={onBack}>{t.back}</BtnSolid>
        </div>
      </div>
    </Card>
  );
}

function TempFail({ t, onContinue, onBack }) {
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
        <H2>{t.fail_title}</H2>
        <P center>{t.fail_sub}</P>
        <MediaBlock type="image" src="/assets/images/No_bebidas.png" height={80} />
        <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 720, marginTop: 8 }}>
          <BtnSolid   wide onClick={onContinue}>{t.continuar}</BtnSolid>
          <BtnPrimary wide onClick={onBack}>{t.back}</BtnPrimary>
        </div>
      </div>
    </Card>
  );
}

/* ===== SPO2 ===== */

function SpO2Info({ t, onMeasure, onBack }) {
  // === Referencias a los botones ===
  const medirRef = useRef(null);
  const backRef = useRef(null);
  const repeatRef = useRef(null);

  // Los agrupamos para pasarlos al hook
  const buttons = [medirRef, backRef, repeatRef];

  // === Integración con joystick ===
  const focused = useJoystickNavigation(buttons, null, onBack);

  return (
    <Card>
      <div style={{ display: "grid", gap: 16 }}>
        <H2>{t.spo2_title}</H2>
        <P center>{t.spo2_instr}</P>

        {/* Video informativo */}
        <MediaBlock type="video" src="/assets/videos/Colocar_brazo.mp4" height={240} />

        {/* Botones */}
        <div style={{ display: "grid", gap: 12, marginTop: 8, maxWidth: 720 }}>
          <button
            ref={medirRef}
            onClick={() => { SFX.start(); onMeasure(); }}
            style={{
              width: "100%",
              background: focused === 0 ? THEME.blueDark : "#B7E5F4",
              color: focused === 0 ? "#fff" : THEME.text,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "all 0.15s ease",
              outline: focused === 0 ? `6px solid ${THEME.ring}` : "none",
            }}
          >
            {t.medir}
          </button>

          <button
            ref={backRef}
            onClick={onBack}
            style={{
              width: "100%",
              background: focused === 1 ? THEME.blue : "#E2E8F0",
              color: focused === 1 ? "#fff" : THEME.blueDark,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "all 0.15s ease",
              outline: focused === 1 ? `6px solid ${THEME.ring}` : "none",
            }}
          >
            {t.back}
          </button>

          <button
            ref={repeatRef}
            onClick={() => alert("Reproducir instrucción")}
            style={{
              width: "100%",
              background: focused === 2 ? "#CDECF5" : "#F8FAFC",
              color: focused === 2 ? THEME.blueDark : THEME.text,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "all 0.15s ease",
              outline: focused === 2 ? `6px solid ${THEME.ring}` : "none",
            }}
          >
            {t.repeat}
          </button>
        </div>
      </div>
    </Card>
  );
}

function SpO2Measuring({ t, onBack, onDone, setSpO2 }) {
  useEffect(() => {
    const id = setTimeout(() => {
      const val = 95 + Math.round(Math.random() * 4); // 95–99 %
      setSpO2(val);
      onDone(val);
    }, 5000);
    return () => clearTimeout(id);
  }, []);
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 24 }}>
        <H2>{t.midiendo}</H2>
        <P center>{t.quieto}</P>
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", height: 26, background: "#CFE6FF", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: "0%", height: "100%", background: THEME.blueDark, animation: "grow 5s linear forwards" }} />
        </div>
        <div style={{ width: "100%", maxWidth: 720 }}>
          <BtnPrimary wide onClick={onBack}>{t.back}</BtnPrimary>
        </div>
      </div>
      <style>{`@keyframes grow { to { width: 100% } }`}</style>
    </Card>
  );
}
function SpO2Done({ t, spo2, onContinue, onBack }) {
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
        <H2>{t.done_title}</H2>
        <P center>{t.done_sub}</P>
        <MediaBlock type="image" src="/assets/images/Carita_feliz.png" height={72} />
        <div style={{ marginTop: 4, color: THEME.muted, fontSize: 26 }}>
          {t.spo2_res_label}: <b style={{ color: THEME.text }}>{spo2 ?? "—"} %</b>
        </div>
        <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 720, marginTop: 8 }}>
          <BtnPrimary wide onClick={onContinue}>{t.continuar}</BtnPrimary>
          <BtnSolid   wide onClick={onBack}>{t.back}</BtnSolid>
        </div>
      </div>
    </Card>
  );
}
function SpO2Fail({ t, onContinue, onBack }) {
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
        <H2>{t.fail_title}</H2>
        <P center>{t.fail_sub}</P>
        <MediaBlock type="image" src="/assets/images/No_bebidas.png" height={80} />
        <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 720, marginTop: 8 }}>
          <BtnSolid   wide onClick={onContinue}>{t.continuar}</BtnSolid>
          <BtnPrimary wide onClick={onBack}>{t.back}</BtnPrimary>
        </div>
      </div>
    </Card>
  );
}

// ECG
function ECGInfo({ title, text, mediaSrc, primaryLabel, onPrimary, onBack }) {
  // === Referencias a los botones ===
  const primaryRef = useRef(null);
  const backRef = useRef(null);
  const repeatRef = useRef(null);

  // Definir los botones que estarán activos
  const buttons = onBack ? [primaryRef, backRef, repeatRef] : [primaryRef, repeatRef];

  // === Integración con joystick ===
  const focused = useJoystickNavigation(buttons, null, onBack);

  return (
    <Card>
      <div style={{ display: "grid", gap: 16 }}>
        <H2>{title}</H2>
        <P center>{text}</P>

        {/* Video de instrucción */}
        <MediaBlock type="video" src={mediaSrc} height={240} />

        {/* Botones de acción */}
        <div style={{ display: "grid", gap: 12, marginTop: 8, maxWidth: 720 }}>
          {/* Botón principal */}
          <button
            ref={primaryRef}
            onClick={onPrimary}
            style={{
              width: "100%",
              background: focused === 0 ? THEME.blueDark : "#B7E5F4",
              color: focused === 0 ? "#fff" : THEME.text,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "all 0.15s ease",
              outline: focused === 0 ? `6px solid ${THEME.ring}` : "none",
            }}
          >
            {primaryLabel}
          </button>

          {/* Botón de volver (solo si se pasa onBack) */}
          {onBack && (
            <button
              ref={backRef}
              onClick={onBack}
              style={{
                width: "100%",
                background: focused === 1 ? THEME.blue : "#E2E8F0",
                color: focused === 1 ? "#fff" : THEME.blueDark,
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 32,
                padding: "18px 28px",
                transition: "all 0.15s ease",
                outline: focused === 1 ? `6px solid ${THEME.ring}` : "none",
              }}
            >
              Volver
            </button>
          )}

          {/* Botón de repetir instrucción */}
          <button
            ref={repeatRef}
            onClick={() => alert("Reproducir instrucción")}
            style={{
              width: "100%",
              background:
                focused === (onBack ? 2 : 1) ? "#CDECF5" : "#F8FAFC",
              color:
                focused === (onBack ? 2 : 1)
                  ? THEME.blueDark
                  : THEME.text,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "all 0.15s ease",
              outline:
                focused === (onBack ? 2 : 1)
                  ? `6px solid ${THEME.ring}`
                  : "none",
            }}
          >
            Repetir instrucción
          </button>
        </div>
      </div>
    </Card>
  );
}


function ECGMeasuring({ onDone, onBack, t }) {
  useEffect(() => { const id = setTimeout(onDone, 6000); return () => clearTimeout(id); }, []);
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 24 }}>
        <H2>{t.midiendo}</H2>
        <P center>{t.quieto}</P>
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", height: 26, background: "#CFE6FF", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: "0%", height: "100%", background: THEME.blueDark, animation: "grow 6s linear forwards" }} />
        </div>
        <div style={{ width: "100%", maxWidth: 720 }}>
          <BtnPrimary wide onClick={onBack}>{t.back}</BtnPrimary>
        </div>
      </div>
      <style>{`@keyframes grow { to { width: 100% } }`}</style>
    </Card>
  );
}

function ECGDone({ t, onContinue }) {
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16, maxWidth: 720 }}>
        <H2>{t.done_title}</H2>
        <P center>{t.done_sub}</P>
        <BtnPrimary wide onClick={onContinue}>{t.continuar}</BtnPrimary>
      </div>
    </Card>
  );
}

function Divider() {
  return <div style={{ height: 2, background: "#7FC9E0", opacity: .9, margin: "10px 0" }} />;
}

function ResultsScreen({ t, dniMasked, vitals, onSend, onBack }) {
  // === Referencia al botón principal ===
  const continuarRef = useRef(null);

  // Agrupamos los botones disponibles (solo uno en este caso)
  const buttons = [continuarRef];

  // === Hook del joystick ===
  const focused = useJoystickNavigation(buttons, null, onBack);

  return (
    <Card>
      <div style={{ display: "grid", gap: 16 }}>
        <H2>{t.resultados_title}</H2>
        <div style={{ fontSize: 26, color: "#1F3344" }}>
          <b>{t.dni_label}</b> ******{dniMasked ?? ""}
        </div>

        <Divider />

        <H2>{t.obtenidos_title}</H2>
        <div style={{ textAlign: "center", color: "#1F3344", fontSize: 26 }}>
          <div style={{ margin: "8px 0" }}>
            Frecuencia cardiaca: <b>{vitals?.hr ?? "--"} lpm</b>
          </div>
          <div style={{ margin: "8px 0" }}>
            Saturación de oxígeno: <b>{vitals?.spo2 ?? "--"} %</b>
          </div>
          <div style={{ margin: "8px 0" }}>
            Temperatura: <b>{vitals?.temp ?? "--"} °C</b>
          </div>
          <div style={{ margin: "8px 0" }}>
            Frecuencia respiratoria: <b>{vitals?.rr ?? "--"} rpm</b>
          </div>
          <div style={{ margin: "8px 0" }}>
            Presión arterial:{" "}
            <b>
              {vitals?.sbp && vitals?.dbp
                ? `${vitals.sbp}/${vitals.dbp}`
                : "--"}{" "}
              mmHg
            </b>
          </div>
        </div>

        {/* Botón “Continuar” */}
        <div style={{ display: "grid", placeItems: "start", marginTop: 12 }}>
          <div style={{ width: "100%", maxWidth: 720 }}>
            <button
              ref={continuarRef}
              onClick={onSend}
              style={{
                width: "100%",
                background: focused === 0 ? THEME.blueDark : "#B7E5F4",
                color: focused === 0 ? "#fff" : THEME.text,
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 32,
                padding: "18px 28px",
                transition: "all 0.15s ease",
                outline: focused === 0 ? `6px solid ${THEME.ring}` : "none",
              }}
            >
              {t.continuar}
            </button>
          </div>
        </div>
      </div>

      {/* Efecto de brillo en botón seleccionado */}
      <style>
        {`
        @keyframes pulse {
          0% { box-shadow: 0 0 0px rgba(31, 177, 151, 0.5); }
          50% { box-shadow: 0 0 20px rgba(31, 177, 151, 0.9); }
          100% { box-shadow: 0 0 0px rgba(31, 177, 151, 0.5); }
        }
        button[style*="outline: 6px solid"] {
          animation: pulse 1.2s infinite;
        }
      `}
      </style>
    </Card>
  );
}


function SendingScreen({ t, onNext }) {
  useEffect(() => { const id = setTimeout(() => onNext(), 1600); return () => clearTimeout(id); }, []);
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
        <H2>{t.enviando}</H2>
        <div style={{ width: 60, height: 60, borderRadius: "50%", border: "6px solid #CDECF5", borderTopColor: THEME.blue, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Card>
  );
}

function PrintingScreen({ t, onNext }) {
  useEffect(() => { const id = setTimeout(() => onNext(), 1600); return () => clearTimeout(id); }, []);
  return (
    <Card>
      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
        <H2>{t.imprimiendo}</H2>
        <div style={{ width: 60, height: 60, borderRadius: "50%", border: "6px solid #CDECF5", borderTopColor: THEME.blue, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Card>
  );
}

function CongratsScreen({ t, onFinish, onBack }) {
  // === Referencias a los botones ===
  const finalizarRef = useRef(null);
  const volverRef = useRef(null);

  // Agrupamos los botones que el joystick puede navegar
  const buttons = [finalizarRef, volverRef];

  // === Hook del joystick ===
  const focused = useJoystickNavigation(buttons, null, onBack);

  return (
    <Card>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          gap: 16,
          maxWidth: 720,
          textAlign: "center",
        }}
      >
        {/* Mensaje de felicitación */}
        <H2>{t.felicidades}</H2>
        <P center>{t.felicidades_msg}</P>

        {/* Imagen de carita feliz */}
        <MediaBlock
          type="image"
          src="/assets/images/Carita_feliz.png"
          height={96}
        />

        {/* Botones de acción */}
        <div
          style={{
            display: "grid",
            gap: 12,
            width: "100%",
            marginTop: 8,
          }}
        >
          {/* Finalizar */}
          <button
            ref={finalizarRef}
            onClick={onFinish}
            style={{
              width: "100%",
              background: focused === 0 ? THEME.blueDark : "#B7E5F4",
              color: focused === 0 ? "#fff" : THEME.text,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "all 0.15s ease",
              outline: focused === 0 ? `6px solid ${THEME.ring}` : "none",
            }}
          >
            {t.finalizar}
          </button>

          {/* Retroceder */}
          <button
            ref={volverRef}
            onClick={onBack}
            style={{
              width: "100%",
              background: focused === 1 ? THEME.blue : "#E2E8F0",
              color: focused === 1 ? "#fff" : THEME.blueDark,
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 32,
              padding: "18px 28px",
              transition: "all 0.15s ease",
              outline: focused === 1 ? `6px solid ${THEME.ring}` : "none",
            }}
          >
            {t.back}
          </button>
        </div>
      </div>

      {/* ✨ Animación tipo arcade para botón seleccionado */}
      <style>
        {`
        @keyframes pulse {
          0% { box-shadow: 0 0 0px rgba(31, 177, 151, 0.5); }
          50% { box-shadow: 0 0 20px rgba(31, 177, 151, 0.9); }
          100% { box-shadow: 0 0 0px rgba(31, 177, 151, 0.5); }
        }
        button[style*="outline: 6px solid"] {
          animation: pulse 1.2s infinite;
        }
      `}
      </style>
    </Card>
  );
}


// ====== App
export default function App() {
  const [lang, setLang] = useState("es");
  const t = I18N[lang];

  const [state, setState] = useState(S.LANG);
  const [temp, setTemp] = useState(null);
  const [spo2, setSpo2] = useState(null);
  const [dni, setDni] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);

  // Vitals simulados (y hook WS si quieres mezclar)
  const [vitals, setVitals] = useState(simulateVitals(Date.now()));
  const wsVitals = useVitalsWS();
  useEffect(() => {
    if (!USE_WS) return;
    if (wsVitals) setVitals((old) => ({ ...old, ...wsVitals }));
  }, [wsVitals]);
  useEffect(() => {
    if (USE_WS) return;
    const id = setInterval(() => setVitals(simulateVitals(Date.now() / 3000)), 1200);
    return () => clearInterval(id);
  }, []);

  const onTempFinished = (val) => {
    const ok = val >= TEMP_MIN_OK && val <= TEMP_MAX_OK;
    if (ok) { SFX.success(); setState(S.SPO2_INFO); }   // → SPO2
    else { SFX.error(); setState(S.TEMP_FAIL); }
  };
  const onSpO2Finished = (val) => {
    const ok = val >= SPO2_MIN_OK;
    if (ok) { SFX.success(); setState(S.SPO2_DONE); }
    else { SFX.error(); setState(S.SPO2_FAIL); }
  };

  // ====== Acciones primarias / back (para Gamepad)
  const doPrimary = () => {
    switch (state) {
      case S.LANG:        return setState(S.PRE1);
      case S.PRE1:        return setState(S.PRE2);
      case S.PRE2:        return setState(S.DNI);
      case S.DNI:         return setState(S.TEMP_INFO); // "Listo" con DNI actual
      case S.TEMP_INFO:   SFX.start(); return setState(S.TEMP_READY);
      case S.TEMP_READY:  return setState(S.TEMP_MEAS);
      case S.TEMP_MEAS:   return onTempFinished(temp ?? 36.7);
      case S.TEMP_DONE:   return setState(S.SPO2_INFO);
      case S.TEMP_FAIL:   return setState(S.TEMP_INFO);

      case S.SPO2_INFO:   SFX.start(); return setState(S.SPO2_READY);
      case S.SPO2_READY:  return setState(S.SPO2_MEAS);
      case S.SPO2_MEAS:   return; // se completa solo
      case S.SPO2_DONE:   return setState(S.ECG_1);
      case S.SPO2_FAIL:   return setState(S.SPO2_INFO);

      case S.ECG_1:       return setState(S.ECG_2);
      case S.ECG_2:       return setState(S.ECG_3);
      case S.ECG_3:       return setState(S.ECG_4);
      case S.ECG_4:       SFX.start(); return setState(S.ECG_READY);
      case S.ECG_READY:   return setState(S.ECG_MEAS);
      case S.ECG_MEAS:    return; // se completa solo
      case S.ECG_DONE:    return setState(S.RESULTS);

      case S.RESULTS:     return (async () => {
                            setState(S.SENDING);
                            try {
                              await sendToCloudMock({ dni, vitals: { ...vitals, temp, spo2: spo2 ?? vitals.spo2 }, ts: Date.now() });
                              setState(S.PRINTING);
                            } catch { setState(S.PRINTING); }
                          })();
      case S.SENDING:     return; // automático
      case S.PRINTING:    return; // automático
      case S.CONGRATS:    return window.location.reload();
      default: return;
    }
  };

  const goBack = () => {
    switch (state) {
      case S.PRE1:       return setState(S.LANG);
      case S.PRE2:       return setState(S.PRE1);
      case S.DNI:        return setState(S.PRE2);

      case S.TEMP_INFO:  return setState(S.DNI);
      case S.TEMP_READY: return setState(S.TEMP_INFO);
      case S.TEMP_MEAS:  return setState(S.TEMP_INFO);
      case S.TEMP_DONE:  return setState(S.TEMP_INFO);
      case S.TEMP_FAIL:  return setState(S.DNI);

      case S.SPO2_INFO:  return setState(S.TEMP_INFO);
      case S.SPO2_READY: return setState(S.SPO2_INFO);
      case S.SPO2_MEAS:  return setState(S.SPO2_INFO);
      case S.SPO2_DONE:  return setState(S.SPO2_INFO);
      case S.SPO2_FAIL:  return setState(S.TEMP_INFO);

      case S.ECG_1:      return setState(S.SPO2_DONE);
      case S.ECG_2:      return setState(S.ECG_1);
      case S.ECG_3:      return setState(S.ECG_2);
      case S.ECG_4:      return setState(S.ECG_3);
      case S.ECG_READY:  return setState(S.ECG_4);
      case S.ECG_MEAS:   return setState(S.ECG_4);
      case S.ECG_DONE:   return setState(S.RESULTS);

      case S.RESULTS:    return setState(S.ECG_DONE);
      case S.CONGRATS:   return setState(S.RESULTS);
      default: return;
    }
  };

  // Opcional: d-pad izq/der para alternar idioma en la pantalla de bienvenida
  const padLeft = () => { if (state === S.LANG) setLang("es"); };
  const padRight = () => { if (state === S.LANG) setLang("qu"); };

  // ===== Mejorado: Gamepad con navegación estilo arcade
  function useJoystickNavigation(buttonRefs, onConfirm, onBack) {
  const [focused, setFocused] = useState(0);
  const lastMove = useRef(0);

  useEffect(() => {
    const loop = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = pads[0];
      if (gp) {
        const now = Date.now();
        const [axX, axY] = gp.axes;

        if (now - lastMove.current > 250) {
          if (axY < -0.5 || gp.buttons[12]?.pressed) {
            setFocused((f) => (f - 1 + buttonRefs.length) % buttonRefs.length);
            lastMove.current = now;
          } else if (axY > 0.5 || gp.buttons[13]?.pressed) {
            setFocused((f) => (f + 1) % buttonRefs.length);
            lastMove.current = now;
          } else if (axX < -0.5 || gp.buttons[14]?.pressed) {
            setFocused((f) => (f - 1 + buttonRefs.length) % buttonRefs.length);
            lastMove.current = now;
          } else if (axX > 0.5 || gp.buttons[15]?.pressed) {
            setFocused((f) => (f + 1) % buttonRefs.length);
            lastMove.current = now;
          }
        }

        if (gp.buttons[0]?.pressed) buttonRefs[focused]?.current?.click();
        if (gp.buttons[1]?.pressed) onBack && onBack();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }, [buttonRefs, focused, onConfirm, onBack]);

  return focused;
}

  return (
    <Frame>
      {state === S.LANG && <LangScreen t={t} lang={lang} setLang={setLang} onNext={setState} />}

      {state === S.PRE1 && (
        <Precheck
          t={t}
          a={t.pre_a1}
          b={t.pre_a2}
          icons={["/assets/images/No_bebidas.png", "/assets/images/Boton_Magenta.png"]}
          onNext={() => setState(S.PRE2)}
          solid
        />
      )}
      {state === S.PRE2 && (
        <Precheck
          t={t}
          a={t.pre_b1}
          b={t.pre_b2}
          icons={["/assets/images/Ayuno.png", "/assets/images/No_embarazada.png"]}
          onNext={() => setState(S.DNI)}
        />
      )}

      {state === S.DNI && (
        <DNIScreen
          t={t}
          onBack={() => setState(S.PRE2)}
          onDone={(value) => { setDni(value); setState(S.TEMP_INFO); }}
        />
      )}

      {state === S.TEMP_INFO  && <TempInfo t={t} onMeasure={() => setState(S.TEMP_READY)} onBack={() => setState(S.DNI)} />}
      {state === S.TEMP_READY && <Countdown t={t} onDone={() => setState(S.TEMP_MEAS)} />}
      {state === S.TEMP_MEAS  && <TempMeasuring t={t} onBack={() => setState(S.TEMP_INFO)} onDone={() => onTempFinished(temp ?? 36.7)} setTemp={setTemp} />}

      {/* SPO2 (entre Temp y ECG) */}
      {state === S.SPO2_INFO  && <SpO2Info t={t} onMeasure={() => setState(S.SPO2_READY)} onBack={() => setState(S.TEMP_INFO)} />}
      {state === S.SPO2_READY && <Countdown t={t} onDone={() => setState(S.SPO2_MEAS)} />}
      {state === S.SPO2_MEAS  && (
        <SpO2Measuring
          t={t}
          onBack={() => setState(S.SPO2_INFO)}
          setSpO2={(val) => { setSpo2(val); setVitals((v) => ({ ...v, spo2: val })); }}
          onDone={(val) => onSpO2Finished(val)}
        />
      )}
      {state === S.SPO2_DONE  && <SpO2Done t={t} spo2={spo2 ?? vitals.spo2} onContinue={() => setState(S.ECG_1)} onBack={() => setState(S.SPO2_INFO)} />}
      {state === S.SPO2_FAIL  && <SpO2Fail t={t} onContinue={() => setState(S.SPO2_INFO)} onBack={() => setState(S.TEMP_INFO)} />}

      {/* ECG */}
      {state === S.ECG_1 && (
        <ECGInfo
          title={t.ecg_title}
          text={t.ecg_1}
          mediaSrc="/assets/videos/Electrodos.mp4"
          primaryLabel={t.continuar}
          onPrimary={() => setState(S.ECG_2)}
          onBack={() => setState(S.SPO2_DONE)}
        />
      )}
      {state === S.ECG_2 && (
        <ECGInfo
          title={t.ecg_title}
          text={t.ecg_2}
          mediaSrc="/assets/videos/Colocarse_electrodos.mp4"
          primaryLabel={t.continuar}
          onPrimary={() => setState(S.ECG_3)}
          onBack={() => setState(S.ECG_1)}
        />
      )}
      {state === S.ECG_3 && (
        <ECGInfo
          title={t.ecg_title}
          text={t.ecg_3}
          mediaSrc="/assets/videos/Click_brazo.mp4"
          primaryLabel={t.continuar}
          onPrimary={() => setState(S.ECG_4)}
          onBack={() => setState(S.ECG_2)}
        />
      )}
      {state === S.ECG_4 && (
        <ECGInfo
          title={t.ecg_title}
          text={t.ecg_4}
          mediaSrc="/assets/videos/Colocar_brazo.mp4"
          primaryLabel={t.medir_ecg}
          onPrimary={() => { SFX.start(); setState(S.ECG_READY); }}
          onBack={() => setState(S.ECG_3)}
        />
      )}
      {state === S.ECG_READY && <Countdown t={t} onDone={() => setState(S.ECG_MEAS)} />}
      {state === S.ECG_MEAS  && <ECGMeasuring t={t} onBack={() => setState(S.ECG_4)} onDone={() => { SFX.success(); setState(S.ECG_DONE); }} />}
      {state === S.ECG_DONE  && <ECGDone t={t} onContinue={() => setState(S.RESULTS)} />}

      {state === S.RESULTS && (
        <ResultsScreen
          t={t}
          dniMasked={dni.slice(-2)}
          vitals={{ ...vitals, temp, spo2: spo2 ?? vitals.spo2 }}
          onSend={async () => {
            setState(S.SENDING);
            try {
              await sendToCloudMock({
                dni,
                vitals: { ...vitals, temp, spo2: spo2 ?? vitals.spo2 },
                ts: Date.now(),
              });
              setState(S.PRINTING);
            } catch (e) {
              setState(S.PRINTING);
            }
          }}
        />
      )}

      {state === S.SENDING  && <SendingScreen  t={t} onNext={() => setState(S.PRINTING)} />}
      {state === S.PRINTING && <PrintingScreen t={t} onNext={() => setState(S.CONGRATS)} />}

      {state === S.CONGRATS && (
        <CongratsScreen
          t={t}
          onFinish={() => window.location.reload()}
          onBack={() => setState(S.RESULTS)}
        />
      )}
    </Frame>
  );
}

