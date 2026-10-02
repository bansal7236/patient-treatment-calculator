import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import iconTpimc from "./assets/icon-tpimc.png";
import iconPimc from "./assets/icon-pimc.png";

/* ---------------- Static content ---------------- */

const ENTITIES = {
  TPIMC: {
    key: "TPIMC",
    name: "Texas Personal Injury Medical Center",
    address: "209 Shady Shores Dr. #300-182, Lake Dallas, TX 75065",
    icon: iconTpimc
  },
  PIMC: {
    key: "PIMC",
    name: "Personal Injury Medical Center",
    address: "209 Shady Shores Dr. #300-182, Lake Dallas, TX 75065",
    icon: iconPimc
  }
};

const TERMS_ITEMS = [
  { title: "Financial Responsibility", body: "Patient retains ultimate liability for all medical bills regardless of pending insurance or legal settlements." },
  { title: "Medical Liens (LOP)", body: "Payment deferral via attorney-approved lien agreements." },
  { title: "Cancellation Policy", body: "Late cancellations or missed visits incur fees and impact claim validity." },
  { title: "Records Release", body: "Authorization to share treatment & billing records with legal counsel and insurers." },
  { title: "Care Compliance", body: "Adherence to prescribed care plans is required." }
];

const PRIVACY_ITEMS = [
  { title: "Information Collected", body: "Personal identifiers (name, phone, email) and protected health information (PHI)." },
  { title: "Data Usage", body: "Restricted to medical care, billing, and direct communications (email/SMS/phone)." },
  { title: "Information Sharing", body: "Disclosed only to authorized medical staff, billing partners, or legal/safety authorities by law." },
  { title: "Patient Rights", body: "Full right to access, correct, or request restrictions on medical records." },
  { title: "Data Security", body: "Safeguarded by strict technical and physical security protocols." }
];

const SERVICE_LIST = [
  "Initial Evaluation",
  "Follow Up visits",
  "Imaging Services - MRI/CT/Ultra Sound/Xray",
  "Physiotherapy - Hot/Cold Pack, E-Stimulation, Therapeutic Activity",
  "Orthopedic services",
  "Pain Management - Surgery Cost/Procedure",
  "Pain Evaluation",
  "Pain Injection",
  "Neuro Physician",
  "Neuro Pain / Traumatic Brain Therapy",
  "Chiropractic Services",
  "Chiropractic Treatment",
  "Post Surgery Equipment",
  "Pharmacy",
  "Medical Records Production",
  "Cancellation Charges / No show Fee",
  "Company expense",
  "Miscellaneous"
];

const REQUIRED_CHARGES = [
  { key: "transport", label: "Transport" },
  { key: "funder", label: "Funder fees" },
  { key: "policyLimit", label: "Policy limit charges" },
  { key: "notary", label: "Notary charge" }
];

function makeRow() {
  return { id: Date.now() + Math.random(), service: "", originalAmount: "", attorneyAmount: "", note: "" };
}

/* ---------------- Accordion ---------------- */

function Accordion({ items, idPrefix }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {items.map((item, i) => {
        const expanded = openIndex === i;
        const panelId = `${idPrefix}-panel-${i}`;
        const headerId = `${idPrefix}-header-${i}`;
        return (
          <div className="acc-item" key={i}>
            <button
              className="acc-header"
              id={headerId}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpenIndex(expanded ? -1 : i)}
            >
              <span className="t">{item.title}</span>
              <span className="acc-icon">+</span>
            </button>
            <div className="acc-panel" id={panelId} role="region" aria-labelledby={headerId} hidden={!expanded}>
              {item.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Legal modal (tabs + accordion) ---------------- */

function LegalModal({ open, initialDoc, onClose }) {
  const [activeDoc, setActiveDoc] = useState(initialDoc || "terms");

  useEffect(() => {
    if (open) setActiveDoc(initialDoc || "terms");
  }, [open, initialDoc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="legal-modal-title">Terms & Privacy</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="legal-tabs" role="tablist" aria-label="Legal documents">
          <button
            className="legal-tab terms"
            role="tab"
            id="tab-terms"
            aria-selected={activeDoc === "terms"}
            aria-controls="tabpanel-terms"
            onClick={() => setActiveDoc("terms")}
          >
            <span className="dot" /> Terms & Conditions
          </button>
          <button
            className="legal-tab privacy"
            role="tab"
            id="tab-privacy"
            aria-selected={activeDoc === "privacy"}
            aria-controls="tabpanel-privacy"
            onClick={() => setActiveDoc("privacy")}
          >
            <span className="dot" /> Privacy Policy
          </button>
        </div>

        {activeDoc === "terms" ? (
          <div className="legal-body" role="tabpanel" id="tabpanel-terms" aria-labelledby="tab-terms">
            <Accordion items={TERMS_ITEMS} idPrefix="terms" />
          </div>
        ) : (
          <div className="legal-body" role="tabpanel" id="tabpanel-privacy" aria-labelledby="tab-privacy">
            <Accordion items={PRIVACY_ITEMS} idPrefix="privacy" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Entity selector ---------------- */

function EntityCard({ entity, selected, onSelect }) {
  return (
    <button type="button" className="entity-card" role="radio" aria-checked={selected} onClick={() => onSelect(entity.key)}>
      <span className="icon-wrap">
        <img src={entity.icon} alt={`${entity.name} logo`} />
      </span>
      <div className="info">
        <div className="name">{entity.name}</div>
        <div className="addr">{entity.address}</div>
      </div>
      <span className="radio-dot" aria-hidden="true" />
    </button>
  );
}

/* ---------------- Screen 1: Select billing entity ---------------- */

function SelectionScreen({ entityKey, setEntityKey, accepted, setAccepted, onContinue, onOpenLegal }) {
  const canContinue = Boolean(entityKey) && accepted;

  return (
    <main className="page">
      <div className="shell narrow">
        <div className="intro-head">
          <p className="kicker">Billing setup</p>
          <h1>Patient Treatment Calculator</h1>
          <p className="sub">Choose which billing entity this bill is issued under to continue.</p>
        </div>

        <div className="step-label">
          <span className="n">1</span> Select billing entity
        </div>
        <div className="entity-grid" role="radiogroup" aria-label="Billing entity">
          <EntityCard entity={ENTITIES.TPIMC} selected={entityKey === "TPIMC"} onSelect={setEntityKey} />
          <EntityCard entity={ENTITIES.PIMC} selected={entityKey === "PIMC"} onSelect={setEntityKey} />
        </div>

        <div className="accept-row">
          <input
            type="checkbox"
            id="accept-terms"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <label htmlFor="accept-terms">
            I have read and accept the{" "}
            <button type="button" className="inline-legal-link" onClick={() => onOpenLegal("terms")}>
              Terms & Conditions
            </button>{" "}
            and{" "}
            <button type="button" className="inline-legal-link" onClick={() => onOpenLegal("privacy")}>
              Privacy Policy
            </button>
            .
          </label>
        </div>

        <div className="continue-row">
          <button
            className="btn solid"
            disabled={!canContinue}
            aria-disabled={!canContinue}
            onClick={() => canContinue && onContinue()}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Screen 2: Calculator ---------------- */

function CalculatorScreen({ entity, onChangeEntity, onOpenLegal }) {
  const [patient, setPatient] = useState({ name: "", dob: "", referralDate: "" });
  const [rows, setRows] = useState([makeRow()]);
  const [discount, setDiscount] = useState("");
  const [charges, setCharges] = useState({ transport: "", funder: "", policyLimit: "", notary: "" });

  const SERVICE_FEE = 10;
  const MONTHLY_CASE_RATE = 20;

  const updatePatient = (e) => setPatient({ ...patient, [e.target.name]: e.target.value });
  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  const addRow = () => setRows([...rows, makeRow()]);
  const updateRow = (id, field, value) => setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const removeRow = (id) => setRows(rows.filter((r) => r.id !== id));

  const updateCharge = (key, value) => setCharges({ ...charges, [key]: value });

  const serviceCount = useMemo(() => rows.filter((r) => r.service).length, [rows]);
  const serviceFeeTotal = serviceCount * SERVICE_FEE;
  const treatmentSubtotal = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.originalAmount) || 0), 0),
    [rows]
  );

  const daysSinceReferral = useMemo(() => {
    if (!patient.referralDate) return null;
    const start = new Date(patient.referralDate + "T00:00:00");
    if (isNaN(start.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return diff >= 0 ? diff : 0;
  }, [patient.referralDate]);
  const caseMonths = daysSinceReferral === null ? 0 : Math.ceil(daysSinceReferral / 30);
  const caseDurationCharge = caseMonths * MONTHLY_CASE_RATE;
  const chargesTotal = REQUIRED_CHARGES.reduce((sum, c) => sum + (Number(charges[c.key]) || 0), 0);

  const originalSubtotal = treatmentSubtotal + serviceFeeTotal + caseDurationCharge + chargesTotal;
  const attorneySubtotal = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.attorneyAmount) || 0), 0),
    [rows]
  );
  const discountPct = Math.min(Math.max(Number(discount) || 0, 0), 100);
  const attorneyDiscountAmount = attorneySubtotal * (discountPct / 100);
  const attorneyFinal = Math.max(attorneySubtotal - attorneyDiscountAmount, 0);

  const clearForm = () => {
    setPatient({ name: "", dob: "", referralDate: "" });
    setRows([makeRow()]);
    setDiscount("");
    setCharges({ transport: "", funder: "", policyLimit: "", notary: "" });
  };

  return (
    <main className="page">
      <div className="shell">
        <header className="masthead">
          <div className="masthead-brand">
            <img className="brand-icon" src={entity.icon} alt={`${entity.name} logo`} />
            <div className="brand-text">
              <div className="brand-name">{entity.name}</div>
              <div className="brand-addr">{entity.address}</div>
            </div>
          </div>
          <div className="masthead-actions">
            <button className="link-btn" onClick={onChangeEntity}>
              Change billing entity
            </button>
            <button className="print-link" onClick={() => window.print()}>
              Print / Save as PDF
            </button>
          </div>
        </header>

        <section className="patient-strip">
          <div className="field">
            <label>Patient name</label>
            <input name="name" value={patient.name} onChange={updatePatient} placeholder="Full name" />
          </div>
          <div className="field">
            <label>Date of birth</label>
            <input type="date" name="dob" value={patient.dob} onChange={updatePatient} />
          </div>
          <div className="field">
            <label>Referral date</label>
            <input type="date" name="referralDate" value={patient.referralDate} onChange={updatePatient} />
          </div>
        </section>

        <div className="workspace">
          <div className="main-col">
          <section className="panel table-panel">
            <div className="panel-head">
              <h2>Treatments & services</h2>
              <button className="add-btn" onClick={addRow}>
                + Add treatment
              </button>
            </div>
            <div className="rows-scroll">
              <div className="col-headers">
                <span className="col-label">#</span>
                <span className="col-label">Treatment / service</span>
                <span className="chip teal">
                  <span className="dot" /> Original
                </span>
                <span className="chip amber">
                  <span className="dot" /> Attorney
                </span>
                <span />
              </div>
              {rows.length === 0 ? (
                <div className="empty-hint">No treatments yet — add one above.</div>
              ) : (
                rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <div className="row">
                      <span className="row-num">{index + 1}</span>
                      <select
                        className="svc-select"
                        value={row.service}
                        onChange={(e) => updateRow(row.id, "service", e.target.value)}
                      >
                        <option value="">Select treatment/service</option>
                        {SERVICE_LIST.map((service, i) => (
                          <option key={i} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                      <div className="amt-wrap teal">
                        <input
                          className="amt-input"
                          type="number"
                          min="0"
                          value={row.originalAmount}
                          placeholder="0.00"
                          onChange={(e) => updateRow(row.id, "originalAmount", e.target.value)}
                        />
                      </div>
                      <div className="amt-wrap amber">
                        <input
                          className="amt-input"
                          type="number"
                          min="0"
                          value={row.attorneyAmount}
                          placeholder="0.00"
                          onChange={(e) => updateRow(row.id, "attorneyAmount", e.target.value)}
                        />
                      </div>
                      <button className="remove-btn" onClick={() => removeRow(row.id)} aria-label="Remove treatment">
                        ×
                      </button>
                    </div>
                    {row.service === "Miscellaneous" && (
                      <div className="note-wrap">
                        <input
                          className="note-input"
                          type="text"
                          value={row.note || ""}
                          placeholder="Describe what this miscellaneous item is..."
                          onChange={(e) => updateRow(row.id, "note", e.target.value)}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </section>

          <section className="panel charges-panel">
            <div className="panel-head">
              <h2>Additional charges</h2>
            </div>
            <div className="charges-grid">
              {REQUIRED_CHARGES.map((c) => {
                const id = "charge-" + c.key;
                return (
                  <div className="charge-field" key={c.key}>
                    <label htmlFor={id}>{c.label}</label>
                    <div className="amt-wrap teal">
                      <input
                        id={id}
                        className="amt-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={charges[c.key]}
                        placeholder="0.00"
                        onChange={(e) => updateCharge(c.key, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          </div>

          <aside className="panel summary-panel">
            <h2>Totals</h2>
            <div className="sum-row">
              <span className="label">Treatment subtotal</span>
              <span className="value">{fmt(treatmentSubtotal)}</span>
            </div>
            <div className="discount-amt-row sum-row">
              <span className="label">Service fee (${SERVICE_FEE} × {serviceCount})</span>
              <span className="value">{fmt(serviceFeeTotal)}</span>
            </div>
            <div className="discount-amt-row sum-row">
              <span className="label">Case duration charge (${MONTHLY_CASE_RATE}/mo)</span>
              <span className="value">{fmt(caseDurationCharge)}</span>
            </div>
            <div className="case-meta">
              {daysSinceReferral === null
                ? "Add a referral date to calculate the case duration charge."
                : `${daysSinceReferral} day${daysSinceReferral === 1 ? "" : "s"} since referral \u2248 ${caseMonths} month${caseMonths === 1 ? "" : "s"} \u00D7 $${MONTHLY_CASE_RATE}`}
            </div>
            <div className="discount-amt-row sum-row">
              <span className="label">Additional charges</span>
              <span className="value">{fmt(chargesTotal)}</span>
            </div>
            <div className="sum-row teal">
              <span className="label">Original amount</span>
              <span className="value">{fmt(originalSubtotal)}</span>
            </div>
            <div className="sum-row amber">
              <span className="label">Attorney amount</span>
              <span className="value">{fmt(attorneySubtotal)}</span>
            </div>
            <div className="discount-row">
              <span className="label">Discount on attorney amount</span>
              <div className="discount-field">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
                <span className="pct">%</span>
              </div>
            </div>
            <div className="discount-amt-row sum-row">
              <span className="label">Discount amount</span>
              <span className="value">{fmt(attorneyDiscountAmount)}</span>
            </div>
            <div className="final-row">
              <span className="label">Attorney amount after discount</span>
              <span className="value">{fmt(attorneyFinal)}</span>
            </div>
          </aside>
        </div>

        <div className="footer-bar">
          <button className="btn ghost" onClick={clearForm}>
            Clear
          </button>
          <button className="btn solid" onClick={() => window.print()}>
            Print bill
          </button>
        </div>
        <p className="footnote">
          Amounts in USD. A ${SERVICE_FEE} service fee per treatment line, a ${MONTHLY_CASE_RATE}/month case
          duration charge (based on the referral date), and any additional charges entered (transport, funder fees,
          policy limit, notary) are added into the Original amount. Discount applies only to the attorney amount —
          Original and Attorney totals are always shown separately.
        </p>
      </div>

      <button className="corner-legal" onClick={() => onOpenLegal("terms")}>
        <span className="dot" /> Terms & Privacy
      </button>
    </main>
  );
}

/* ---------------- Root app ---------------- */

function App() {
  const [step, setStep] = useState("select");
  const [entityKey, setEntityKey] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState("terms");

  const openLegal = (doc) => {
    setLegalDoc(doc);
    setLegalOpen(true);
  };
  const closeLegal = () => setLegalOpen(false);

  const screen =
    step === "calculator" && entityKey ? (
      <CalculatorScreen entity={ENTITIES[entityKey]} onChangeEntity={() => setStep("select")} onOpenLegal={openLegal} />
    ) : (
      <SelectionScreen
        entityKey={entityKey}
        setEntityKey={setEntityKey}
        accepted={accepted}
        setAccepted={setAccepted}
        onContinue={() => setStep("calculator")}
        onOpenLegal={openLegal}
      />
    );

  return (
    <>
      {screen}
      <LegalModal open={legalOpen} initialDoc={legalDoc} onClose={closeLegal} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
