import io
from datetime import datetime

import matplotlib
matplotlib.use("Agg")  # non-interactive backend, safe for a server process
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

ACCENT = colors.HexColor("#2563EB")
DARK = colors.HexColor("#111827")
MUTED = colors.HexColor("#6B7280")
LIGHT_FILL = colors.HexColor("#F3F4F6")

DENSITY_COLORS = {
    "Light": colors.HexColor("#10B981"),
    "Moderate": colors.HexColor("#F59E0B"),
    "Heavy": colors.HexColor("#EF4444"),
}


def _build_trend_chart_image(trend: list[dict]) -> io.BytesIO | None:
    """Renders the active-vehicles-over-time trend as a PNG, returned as an in-memory buffer."""
    if not trend:
        return None

    frames = [t["frame_index"] for t in trend]
    values = [t["avg_active_vehicles"] for t in trend]

    fig, ax = plt.subplots(figsize=(6.2, 2.6), dpi=150)
    ax.plot(frames, values, color="#2563EB", linewidth=2)
    ax.fill_between(frames, values, color="#2563EB", alpha=0.08)
    ax.set_xlabel("Frame", fontsize=8, color="#6B7280")
    ax.set_ylabel("Avg active vehicles", fontsize=8, color="#6B7280")
    ax.tick_params(labelsize=7, colors="#6B7280")
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    for spine in ("left", "bottom"):
        ax.spines[spine].set_color("#E5E7EB")
    ax.grid(True, linestyle="--", linewidth=0.5, color="#E5E7EB")
    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return buf


def generate_session_report_pdf(session, counts_by_class: dict, trend: list[dict], user_name: str, user_email: str) -> bytes:
    """
    session: a db_models.Session ORM object
    counts_by_class: {"car": 8, "truck": 3, ...}
    trend: list of {"frame_index", "active_vehicles", "avg_active_vehicles", "density_level"}
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=20 * mm, bottomMargin=18 * mm, leftMargin=18 * mm, rightMargin=18 * mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleCustom", parent=styles["Title"], fontSize=20, textColor=DARK, spaceAfter=2)
    subtitle_style = ParagraphStyle("SubtitleCustom", parent=styles["Normal"], fontSize=10, textColor=MUTED, spaceAfter=14)
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=12, textColor=DARK, spaceBefore=16, spaceAfter=8)
    body_style = ParagraphStyle("BodyCustom", parent=styles["Normal"], fontSize=9.5, textColor=DARK, leading=14)
    muted_style = ParagraphStyle("Muted", parent=styles["Normal"], fontSize=8.5, textColor=MUTED)

    elements = []

    # --- Header ---
    elements.append(Paragraph("AI Traffic Analyzer", title_style))
    elements.append(Paragraph("Session Analysis Report", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.2, color=ACCENT, spaceAfter=14))

    # --- Session info table ---
    started = session.started_at.strftime("%d %b %Y, %H:%M") if session.started_at else "--"
    ended = session.ended_at.strftime("%d %b %Y, %H:%M") if session.ended_at else "In progress"
    duration = "--"
    if session.started_at and session.ended_at:
        seconds = (session.ended_at - session.started_at).total_seconds()
        duration = f"{int(seconds // 60)}m {int(seconds % 60)}s"

    info_data = [
        ["Video File", session.video_id],
        ["Analyzed By", f"{user_name} ({user_email})"],
        ["Started", started],
        ["Ended", ended],
        ["Processing Duration", duration],
        ["Report Generated", datetime.now().strftime("%d %b %Y, %H:%M")],
    ]
    info_table = Table(info_data, colWidths=[45 * mm, 120 * mm])
    info_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), MUTED),
        ("TEXTCOLOR", (1, 0), (1, -1), DARK),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#E5E7EB")),
    ]))
    elements.append(info_table)

    # --- Summary stats ---
    elements.append(Paragraph("Summary", section_style))

    total_crossed = session.total_crossed or 0
    final_density = session.final_density or "--"
    density_color = DENSITY_COLORS.get(final_density, DARK)
    peak_avg = max((t["avg_active_vehicles"] for t in trend), default=0)

    stat_data = [
        ["Total Vehicles Crossed", "Final Density", "Peak Avg. Active Vehicles"],
        [str(total_crossed), final_density, f"{peak_avg:.1f}"],
    ]
    stat_table = Table(stat_data, colWidths=[55 * mm, 55 * mm, 55 * mm])
    stat_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_FILL),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("TEXTCOLOR", (0, 0), (-1, 0), MUTED),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 1), (-1, 1), 18),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 1), (0, 1), DARK),
        ("TEXTCOLOR", (1, 1), (1, 1), density_color),
        ("TEXTCOLOR", (2, 1), (2, 1), DARK),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 1), (-1, 1), 10),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 14),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#E5E7EB")),
        ("INNERGRID", (0, 0), (-1, -1), 0.75, colors.HexColor("#E5E7EB")),
    ]))
    elements.append(stat_table)

    # --- Trend chart ---
    chart_buf = _build_trend_chart_image(trend)
    if chart_buf:
        elements.append(Paragraph("Active Vehicles Over Time", section_style))
        elements.append(Image(chart_buf, width=170 * mm, height=72 * mm))

    # --- Per-class breakdown table ---
    elements.append(Paragraph("Vehicles by Class", section_style))
    if counts_by_class:
        total = sum(counts_by_class.values()) or 1
        class_data = [["Vehicle Type", "Count", "Share"]]
        for cls_name, count in sorted(counts_by_class.items(), key=lambda x: -x[1]):
            pct = (count / total) * 100
            class_data.append([cls_name.capitalize(), str(count), f"{pct:.0f}%"])

        class_table = Table(class_data, colWidths=[70 * mm, 45 * mm, 50 * mm])
        class_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_FILL]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ]))
        elements.append(class_table)
    else:
        elements.append(Paragraph("No vehicles crossed the counting line during this session.", body_style))

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E7EB")))
    elements.append(Paragraph(
        "Generated automatically by AI Traffic Analyzer. Vehicle counts are derived from YOLO-based "
        "detection with ByteTrack multi-object tracking; density levels are calculated from a smoothed "
        "rolling average of active vehicles per frame.",
        muted_style,
    ))

    doc.build(elements)
    buf.seek(0)
    return buf.read()
