import { Document, Page, View, Text, StyleSheet, pdf } from "@react-pdf/renderer";

const ACCENT = "#E84855";
const TEAL = "#2EC4B6";
const BLUE = "#3185FC";
const AMBER = "#F9A03F";
const DARK = "#111827";
const MID = "#374151";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const BG_LIGHT = "#F9FAFB";

const s = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", paddingHorizontal: 48, paddingVertical: 44, fontFamily: "Helvetica" },

  // Cover
  coverAccentBar: { width: 6, height: 52, borderRadius: 3, backgroundColor: ACCENT, marginRight: 14 },
  coverTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", color: DARK, letterSpacing: -0.5 },
  coverSub: { fontSize: 11, color: MUTED, marginTop: 4 },
  coverProduct: { marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: BORDER },
  coverProductLabel: { fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  coverProductName: { fontSize: 22, fontFamily: "Helvetica-Bold", color: DARK },
  coverProductDesc: { fontSize: 11, color: MID, marginTop: 6, lineHeight: 1.6 },
  coverPersonaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 },
  coverPersonaChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: BORDER, backgroundColor: BG_LIGHT },
  coverPersonaName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK, marginRight: 4 },
  coverPersonaRole: { fontSize: 9, color: MUTED },
  coverDate: { position: "absolute", bottom: 44, right: 48, fontSize: 10, color: MUTED },

  // Section divider
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, marginTop: 4 },
  sectionAccent: { width: 4, height: 20, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 15, fontFamily: "Helvetica-Bold", color: DARK },
  sectionSub: { fontSize: 10, color: MUTED, marginTop: 1 },

  // Persona feedback
  personaHeader: { flexDirection: "row", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  personaAvatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: BG_LIGHT, alignItems: "center", justifyContent: "center", marginRight: 12 },
  personaAvatarText: { fontSize: 22 },
  personaName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: DARK },
  personaRole: { fontSize: 10, color: MUTED, marginTop: 2 },
  personaHeadline: { fontSize: 11, color: ACCENT, marginTop: 3, fontFamily: "Helvetica-Oblique" },
  scoreBox: { marginLeft: "auto", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  scoreNum: { fontSize: 28, fontFamily: "Helvetica-Bold" },
  scoreLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: MUTED, marginTop: 1 },

  // Ratings
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  ratingLabel: { fontSize: 10, color: MID, width: 70 },
  ratingTrack: { flex: 1, height: 5, backgroundColor: "#F3F4F6", borderRadius: 3, marginHorizontal: 8 },
  ratingFill: { height: 5, borderRadius: 3 },
  ratingValue: { fontSize: 10, fontFamily: "Helvetica-Bold", width: 28, textAlign: "right" },

  // Two-col layout
  twoCol: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },

  // Review text
  reviewText: { fontSize: 10.5, color: MID, lineHeight: 1.65 },

  // Dealbreakers / competitor
  dealbreakersBox: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#FCA5A5", backgroundColor: "#FFF1F2", marginTop: 10 },
  dealbreakersTitle: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", color: ACCENT, marginBottom: 5 },
  dealbreakersItem: { flexDirection: "row", marginBottom: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: ACCENT },
  dealbreakersText: { fontSize: 10, color: DARK, lineHeight: 1.5 },

  competitorBox: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#BFDBFE", backgroundColor: "#EFF6FF", marginTop: 10 },
  competitorTitle: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 5 },
  competitorText: { fontSize: 10, color: DARK, lineHeight: 1.5 },

  // Buy formula
  buyBox: { marginTop: 10, padding: 8, backgroundColor: BG_LIGHT, borderRadius: 6, borderWidth: 1, borderColor: BORDER, borderStyle: "dashed" },
  buyLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: MUTED, marginBottom: 3 },
  buyFormula: { fontSize: 9.5, color: MID, fontFamily: "Helvetica" },

  // Comparison table
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: "hidden", marginTop: 6 },
  tableHead: { flexDirection: "row", backgroundColor: BG_LIGHT, paddingVertical: 6, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableHeadCell: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: MUTED, fontFamily: "Helvetica-Bold", flex: 1, textAlign: "center" },
  tableHeadFirst: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: MUTED, fontFamily: "Helvetica-Bold", flex: 2 },
  tableRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableCell: { fontSize: 10, fontFamily: "Helvetica-Bold", flex: 1, textAlign: "center" },
  tableCellFirst: { fontSize: 10, color: DARK, flex: 2 },

  // JTBD
  execSummary: { fontSize: 12, color: MID, lineHeight: 1.7, fontFamily: "Helvetica-Oblique" },
  forcesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  forceCard: { flex: 1, minWidth: "47%", padding: 10, borderRadius: 6, borderWidth: 1, borderLeftWidth: 3 },
  forceTitle: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  forceText: { fontSize: 10, color: MID, lineHeight: 1.5 },
  jobCard: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: BORDER, marginBottom: 6, borderLeftWidth: 3 },
  jobBadge: { fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, marginRight: 5 },
  jobStatement: { fontSize: 10.5, color: DARK, lineHeight: 1.5, fontFamily: "Helvetica-Oblique", marginTop: 5 },
  jobMeta: { fontSize: 9, color: MUTED, marginTop: 3 },
  jobEvidence: { fontSize: 9, color: MID, marginTop: 5, lineHeight: 1.5 },
  optionCard: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: BORDER, marginBottom: 6 },
  optionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: DARK },
  optionMeta: { flexDirection: "row", gap: 10, marginTop: 3, marginBottom: 6 },
  optionMetaText: { fontSize: 9 },
  optionDesc: { fontSize: 10, color: MID, lineHeight: 1.5 },
  optionRisk: { fontSize: 9, color: ACCENT, marginTop: 4, fontFamily: "Helvetica-Oblique" },
  actionCol: { flex: 1, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: BORDER, borderTopWidth: 3 },
  actionTitle: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  actionItem: { fontSize: 10, color: MID, marginBottom: 5, lineHeight: 1.5, paddingLeft: 6, borderLeftWidth: 2 },

  // Pre-mortem
  verdictBox: { padding: 14, borderRadius: 8, backgroundColor: "#FFF1F2", borderWidth: 1, borderColor: "#FCA5A5", borderLeftWidth: 4, borderLeftColor: ACCENT, marginBottom: 14 },
  verdictText: { fontSize: 13, fontFamily: "Helvetica-Bold", color: ACCENT, lineHeight: 1.5 },
  scenarioCard: { padding: 10, borderRadius: 6, borderLeftWidth: 3, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  scenarioTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: DARK },
  scenarioBadge: { fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  scenarioDesc: { fontSize: 10, color: MID, lineHeight: 1.55, marginTop: 5 },
  scenarioEvidence: { fontSize: 9, color: MUTED, marginTop: 4, fontFamily: "Helvetica-Oblique" },
  fatalBox: { flex: 1, padding: 12, borderRadius: 6, borderWidth: 1, borderColor: BORDER, borderTopWidth: 3 },
  fatalTitle: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  fatalText: { fontSize: 11, color: MID, lineHeight: 1.55 },

  // Utility
  pageFooter: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: MUTED },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 16 },
  label: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", color: MUTED, marginBottom: 4 },
  pageBreak: { marginTop: 0 },
});

function ratingColor(v) {
  return v <= 3 ? ACCENT : v <= 5 ? AMBER : v <= 7 ? BLUE : TEAL;
}

function probColor(v) {
  return parseInt(v) < 30 ? ACCENT : parseInt(v) < 60 ? AMBER : TEAL;
}

function priorityColor(p) {
  return p === "critical" ? ACCENT : p === "high" ? AMBER : p === "medium" ? BLUE : "#9CA3AF";
}

function probColor2(p) {
  return p === "high" ? ACCENT : p === "medium" ? AMBER : BLUE;
}

const Footer = ({ productName, page }) => (
  <View style={s.pageFooter} fixed>
    <Text style={s.footerText}>Persona Research Lab · {productName}</Text>
    <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const CoverPage = ({ productName, productDesc, personas, results, date }) => {
  const reviewedPersonas = personas.filter(p => results[p.id]);
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
        <View style={s.coverAccentBar} />
        <View>
          <Text style={s.coverTitle}>Persona Research Lab</Text>
          <Text style={s.coverSub}>Adversarial Feedback · JTBD + Four Forces · Pre-Mortem</Text>
        </View>
      </View>

      <View style={s.coverProduct}>
        <Text style={s.coverProductLabel}>Product Under Review</Text>
        <Text style={s.coverProductName}>{productName}</Text>
        {productDesc ? <Text style={s.coverProductDesc}>{productDesc}</Text> : null}
      </View>

      {reviewedPersonas.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={s.label}>Personas</Text>
          <View style={s.coverPersonaRow}>
            {reviewedPersonas.map(p => (
              <View key={p.id} style={s.coverPersonaChip}>
                <Text style={s.coverPersonaName}>{p.name}</Text>
                <Text style={s.coverPersonaRole}>{p.role}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={s.coverDate}>Generated {date}</Text>
    </Page>
  );
};

const PersonaPage = ({ persona, result }) => {
  const oc = ratingColor(result.ratings.overall);
  const calculated = result.buyParams
    ? Math.round((result.buyParams.val + result.buyParams.usa) / (result.buyParams.pri * result.buyParams.ske) * 25)
    : null;

  return (
    <Page size="A4" style={s.page}>
      {/* Header */}
      <View style={s.personaHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.personaName}>{persona.name}</Text>
          <Text style={s.personaRole}>{persona.role}</Text>
          <Text style={s.personaHeadline}>"{result.headline}"</Text>
        </View>
        <View style={[s.scoreBox, { backgroundColor: oc + "18" }]}>
          <Text style={[s.scoreNum, { color: oc }]}>{result.ratings.overall}</Text>
          <Text style={s.scoreLabel}>Overall</Text>
        </View>
      </View>

      {/* Ratings + Review */}
      <View style={s.twoCol}>
        <View style={s.col}>
          <Text style={s.label}>Ratings</Text>
          {[["Value", "$", result.ratings.value], ["Usability", "◎", result.ratings.usability], ["Reliability", "⚙", result.ratings.reliability], ["Recommend", "➤", result.ratings.wouldRecommend]].map(([label, , val]) => (
            <View key={label} style={s.ratingRow}>
              <Text style={s.ratingLabel}>{label}</Text>
              <View style={s.ratingTrack}>
                <View style={[s.ratingFill, { width: `${val * 10}%`, backgroundColor: ratingColor(val) }]} />
              </View>
              <Text style={[s.ratingValue, { color: ratingColor(val) }]}>{val}/10</Text>
            </View>
          ))}

          {/* Buy probability */}
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
              <Text style={[s.label, { marginBottom: 0, marginRight: 8 }]}>Buy Probability</Text>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: probColor(result.buyProbability) }}>{result.buyProbability}%</Text>
            </View>
            {result.buyParams && (
              <View style={s.buyBox}>
                <Text style={s.buyLabel}>Formula Audit</Text>
                <Text style={s.buyFormula}>
                  round((val:{result.buyParams.val} + usa:{result.buyParams.usa}) / (price:{result.buyParams.pri} × skep:{result.buyParams.ske}) × 25) = {calculated}%
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.col}>
          <Text style={s.label}>Review</Text>
          <Text style={s.reviewText}>{result.review}</Text>
        </View>
      </View>

      {/* Dealbreakers + Competitor */}
      <View style={[s.twoCol, { marginTop: 2 }]}>
        <View style={[s.dealbreakersBox, { flex: 1, marginTop: 0 }]}>
          <Text style={s.dealbreakersTitle}>✕  Dealbreakers</Text>
          {(result.dealbreakers || []).map((d, i) => (
            <View key={i} style={s.dealbreakersItem}>
              <Text style={s.dealbreakersText}>{d}</Text>
            </View>
          ))}
        </View>
        <View style={[s.competitorBox, { flex: 1, marginTop: 0 }]}>
          <Text style={s.competitorTitle}>↗  Competitor Preferred</Text>
          <Text style={s.competitorText}>{result.competitorMention || "None specified"}</Text>
        </View>
      </View>

      <Footer productName={""} />
    </Page>
  );
};

const ComparisonPage = ({ personas, results }) => {
  const reviewed = personas.filter(p => results[p.id]);
  const dims = [
    { key: "overall", label: "Overall" },
    { key: "value", label: "Value" },
    { key: "usability", label: "Usability" },
    { key: "reliability", label: "Reliability" },
    { key: "wouldRecommend", label: "Recommend" },
  ];

  return (
    <Page size="A4" style={s.page}>
      <View style={s.sectionHeader}>
        <View style={[s.sectionAccent, { backgroundColor: BLUE }]} />
        <View>
          <Text style={s.sectionTitle}>Rating Comparison</Text>
          <Text style={[s.sectionSub, { marginTop: 0 }]}>All personas side by side</Text>
        </View>
      </View>

      <View style={s.table}>
        <View style={s.tableHead}>
          <Text style={s.tableHeadFirst}>Persona</Text>
          {dims.map(d => <Text key={d.key} style={s.tableHeadCell}>{d.label}</Text>)}
          <Text style={s.tableHeadCell}>Buy %</Text>
        </View>
        {reviewed.map((p, i) => (
          <View key={p.id} style={[s.tableRow, i % 2 === 1 ? { backgroundColor: BG_LIGHT } : {}]}>
            <Text style={s.tableCellFirst}>{p.name}</Text>
            {dims.map(d => {
              const v = results[p.id].ratings[d.key];
              return <Text key={d.key} style={[s.tableCell, { color: ratingColor(v) }]}>{v}</Text>;
            })}
            <Text style={[s.tableCell, { color: probColor(results[p.id].buyProbability) }]}>{results[p.id].buyProbability}%</Text>
          </View>
        ))}
      </View>

      {/* Dealbreaker convergence */}
      <View style={{ marginTop: 24 }}>
        <View style={s.sectionHeader}>
          <View style={[s.sectionAccent, { backgroundColor: ACCENT }]} />
          <View>
            <Text style={s.sectionTitle}>Dealbreaker Convergence</Text>
            <Text style={[s.sectionSub, { marginTop: 0 }]}>Issues shared across multiple personas</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {(() => {
            const db = {};
            reviewed.forEach(p => (results[p.id].dealbreakers || []).forEach(d => {
              const k = d.toLowerCase().slice(0, 40);
              if (!db[k]) db[k] = { text: d, n: 0 };
              db[k].n++;
            }));
            return Object.values(db).sort((a, b) => b.n - a.n).map((d, i) => (
              <View key={i} style={{ padding: "5 9", borderRadius: 5, borderWidth: 1, borderColor: d.n > 1 ? "#FCA5A5" : BORDER, backgroundColor: d.n > 1 ? "#FFF1F2" : BG_LIGHT }}>
                <Text style={{ fontSize: 10, color: d.n > 1 ? ACCENT : MID }}>{d.text}</Text>
              </View>
            ));
          })()}
        </View>
      </View>

      <Footer productName={""} />
    </Page>
  );
};

const JTBDPage = ({ synthesis }) => (
  <Page size="A4" style={s.page}>
    <View style={s.sectionHeader}>
      <View style={[s.sectionAccent, { backgroundColor: TEAL }]} />
      <View>
        <Text style={s.sectionTitle}>JTBD Synthesis</Text>
        <Text style={[s.sectionSub, { marginTop: 0 }]}>Christensen Framework · Four Forces · Friction Map</Text>
      </View>
    </View>

    {/* Executive Summary */}
    <View style={{ marginBottom: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderLeftWidth: 3, borderColor: "#99F6E4", borderLeftColor: TEAL, backgroundColor: "#F0FDFA" }}>
      <Text style={[s.label, { color: TEAL, marginBottom: 5 }]}>Executive Summary</Text>
      <Text style={s.execSummary}>{synthesis.executiveSummary}</Text>
    </View>

    {/* Four Forces */}
    {synthesis.forces && (
      <View style={{ marginBottom: 16 }}>
        <Text style={[s.label, { marginBottom: 8 }]}>Four Forces of Switching</Text>
        <View style={s.forcesGrid}>
          {[
            ["Push", synthesis.forces.push, ACCENT, "#FFF1F2", "#FCA5A5"],
            ["Pull", synthesis.forces.pull, TEAL, "#F0FDFA", "#99F6E4"],
            ["Anxiety", synthesis.forces.anxiety, AMBER, "#FFFBEB", "#FDE68A"],
            ["Habit", synthesis.forces.habit, BLUE, "#EFF6FF", "#BFDBFE"],
          ].map(([label, text, color, bg, bc]) => (
            <View key={label} style={[s.forceCard, { borderColor: bc, borderLeftColor: color, backgroundColor: bg }]}>
              <Text style={[s.forceTitle, { color }]}>{label}</Text>
              <Text style={s.forceText}>{text}</Text>
            </View>
          ))}
        </View>
        {synthesis.switchingCost && (
          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", padding: "8 12", backgroundColor: BG_LIGHT, borderRadius: 6, borderWidth: 1, borderColor: BORDER }}>
            <Text style={{ fontSize: 10, color: MUTED, flex: 1 }}>Switching Cost</Text>
            <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: ratingColor(synthesis.switchingCost.score) }}>{synthesis.switchingCost.score}/10</Text>
          </View>
        )}
      </View>
    )}

    {/* Jobs */}
    <Text style={[s.label, { marginBottom: 6 }]}>Identified Jobs</Text>
    {(synthesis.jobs || []).map((j, i) => (
      <View key={i} style={[s.jobCard, { borderLeftColor: priorityColor(j.priority), borderColor: BORDER }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[s.jobBadge, { color: priorityColor(j.priority), backgroundColor: priorityColor(j.priority) + "18" }]}>{j.priority}</Text>
          {j.dimension && <Text style={[s.jobBadge, { color: BLUE, backgroundColor: BLUE + "18" }]}>{j.dimension}</Text>}
        </View>
        <Text style={s.jobStatement}>"{j.statement}"</Text>
        <Text style={s.jobMeta}>Shared by: {(j.sharedAcross || []).join(", ")}</Text>
        {j.evidence && <Text style={s.jobEvidence}>Evidence: {j.evidence}</Text>}
      </View>
    ))}

    <Footer productName={""} />
  </Page>
);

const JTBDPage2 = ({ synthesis }) => (
  <Page size="A4" style={s.page}>
    {/* Friction Points */}
    {synthesis.frictionPoints?.length > 0 && (
      <View style={{ marginBottom: 20 }}>
        <Text style={[s.label, { marginBottom: 8 }]}>Persona Friction Points</Text>
        {synthesis.frictionPoints.map((f, i) => (
          <View key={i} style={{ padding: 10, borderRadius: 6, borderWidth: 1, borderLeftWidth: 3, borderColor: BORDER, borderLeftColor: ACCENT, marginBottom: 6 }}>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 4 }}>{(f.personas || []).join(" vs ")}</Text>
            <Text style={{ fontSize: 10, color: MID, lineHeight: 1.5, marginBottom: 3 }}>{f.conflict}</Text>
            <Text style={{ fontSize: 9.5, color: TEAL, fontFamily: "Helvetica-Oblique" }}>Resolution: {f.tradeoff}</Text>
          </View>
        ))}
      </View>
    )}

    {/* Product Options */}
    {synthesis.productOptions?.length > 0 && (
      <View style={{ marginBottom: 20 }}>
        <Text style={[s.label, { marginBottom: 8 }]}>Product Options</Text>
        {synthesis.productOptions.map((o, i) => (
          <View key={i} style={s.optionCard}>
            <Text style={s.optionTitle}>{o.title}</Text>
            <View style={s.optionMeta}>
              <Text style={[s.optionMetaText, { color: o.effort === "low" ? TEAL : o.effort === "medium" ? AMBER : ACCENT }]}>Effort: {o.effort}</Text>
              <Text style={[s.optionMetaText, { color: o.impact === "high" ? TEAL : o.impact === "medium" ? AMBER : ACCENT }]}>Impact: {o.impact}</Text>
            </View>
            <Text style={s.optionDesc}>{o.description}</Text>
            {o.riskIfIgnored && <Text style={s.optionRisk}>Risk if ignored: {o.riskIfIgnored}</Text>}
          </View>
        ))}
      </View>
    )}

    {/* Action columns */}
    <View style={{ flexDirection: "row", gap: 10 }}>
      {[
        [TEAL, "Do This Week", synthesis.immediateActions],
        [BLUE, "Validate With Users", synthesis.validationQuestions],
        [AMBER, "Blind Spots", synthesis.blindSpots],
      ].map(([color, title, items]) => (
        <View key={title} style={[s.actionCol, { borderTopColor: color }]}>
          <Text style={[s.actionTitle, { color }]}>{title}</Text>
          {(items || []).map((a, i) => (
            <View key={i} style={[s.actionItem, { borderLeftColor: color }]}>
              <Text style={{ fontSize: 10, color: MID, lineHeight: 1.5 }}>{a}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>

    <Footer productName={""} />
  </Page>
);

const PreMortemPage = ({ steelMan }) => (
  <Page size="A4" style={s.page}>
    <View style={s.sectionHeader}>
      <View style={[s.sectionAccent, { backgroundColor: ACCENT }]} />
      <View>
        <Text style={s.sectionTitle}>Pre-Mortem: Tell Me Why I'm Wrong</Text>
        <Text style={[s.sectionSub, { marginTop: 0 }]}>Most likely failure scenarios · 12-month horizon</Text>
      </View>
    </View>

    <View style={s.verdictBox}>
      <Text style={s.verdictText}>{steelMan.verdict}</Text>
    </View>

    <Text style={[s.label, { marginBottom: 8 }]}>Failure Scenarios</Text>
    {(steelMan.failureScenarios || []).map((sc, i) => {
      const pc = probColor2(sc.probability);
      return (
        <View key={i} style={[s.scenarioCard, { borderLeftColor: pc }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Text style={s.scenarioTitle}>{sc.title}</Text>
            <Text style={[s.scenarioBadge, { color: pc, backgroundColor: pc + "18" }]}>{sc.probability}</Text>
          </View>
          <Text style={s.scenarioDesc}>{sc.description}</Text>
          {sc.evidence && <Text style={s.scenarioEvidence}>Evidence: {sc.evidence}</Text>}
        </View>
      );
    })}

    <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
      <View style={[s.fatalBox, { borderTopColor: ACCENT }]}>
        <Text style={[s.fatalTitle, { color: ACCENT }]}>Fatal Assumption</Text>
        <Text style={s.fatalText}>{steelMan.fatalAssumption}</Text>
      </View>
      <View style={[s.fatalBox, { borderTopColor: TEAL }]}>
        <Text style={[s.fatalTitle, { color: TEAL }]}>Survival Condition</Text>
        <Text style={s.fatalText}>{steelMan.survivalCondition}</Text>
      </View>
    </View>

    <Footer productName={""} />
  </Page>
);

function buildDoc({ personas, results, synthesis, steelMan, productName, productDesc }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reviewed = personas.filter(p => results[p.id]);

  return (
    <Document title={`${productName} — Persona Research`} author="Persona Research Lab">
      <CoverPage productName={productName} productDesc={productDesc} personas={personas} results={results} date={date} />
      {reviewed.map(p => <PersonaPage key={p.id} persona={p} result={results[p.id]} />)}
      {reviewed.length >= 2 && <ComparisonPage personas={personas} results={results} />}
      {synthesis && <JTBDPage synthesis={synthesis} />}
      {synthesis && <JTBDPage2 synthesis={synthesis} />}
      {steelMan && <PreMortemPage steelMan={steelMan} />}
    </Document>
  );
}

export async function downloadFeedbackPDF({ personas, results, synthesis, steelMan, productName, productDesc }) {
  const doc = buildDoc({ personas, results, synthesis, steelMan, productName, productDesc });
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${productName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-feedback.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
