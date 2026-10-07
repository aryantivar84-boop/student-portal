import io
import os
import datetime
import calendar
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from django.utils import timezone

from html.parser import HTMLParser
import re

ASSETS_DIR = os.path.join(os.path.dirname(__file__), 'assets')


class ReportLabHTMLCleaner(HTMLParser):
    """
    Parses arbitrary HTML from rich-text editors into a list of
    well-formed, balanced ReportLab-compatible paragraph XML strings.
    Guarantees every opening tag is properly closed within each paragraph block.
    """
    def __init__(self):
        super().__init__()
        self.paragraphs = []
        self.current_text = []
        self.open_tags = [] # list of (tag, attr_str)

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        attr_dict = dict(attrs)

        if tag in ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']:
            self._flush_paragraph()
            for t, attr_str in self.open_tags:
                self.current_text.append(f'<{t}{attr_str}>')
        elif tag in ['b', 'strong']:
            self.open_tags.append(('b', ''))
            self.current_text.append('<b>')
        elif tag in ['i', 'em']:
            self.open_tags.append(('i', ''))
            self.current_text.append('<i>')
        elif tag == 'u':
            self.open_tags.append(('u', ''))
            self.current_text.append('<u>')
        elif tag in ['strike', 's', 'del']:
            self.open_tags.append(('strike', ''))
            self.current_text.append('<strike>')
        elif tag == 'sub':
            self.open_tags.append(('sub', ''))
            self.current_text.append('<sub>')
        elif tag == 'sup':
            self.open_tags.append(('sup', ''))
            self.current_text.append('<sup>')
        elif tag == 'br':
            self.current_text.append('<br/>')
        elif tag in ['span', 'font']:
            style = attr_dict.get('style', '')
            color = attr_dict.get('color', '')
            cm = re.search(r'color\s*:\s*([^;"]+)', style)
            if cm:
                color = cm.group(1).strip()
            if color:
                attr = f' color="{color}"'
                self.open_tags.append(('font', attr))
                self.current_text.append(f'<font{attr}>')

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']:
            self._flush_paragraph()
        elif tag in ['b', 'strong']:
            self._close_open_tag('b')
        elif tag in ['i', 'em']:
            self._close_open_tag('i')
        elif tag == 'u':
            self._close_open_tag('u')
        elif tag in ['strike', 's', 'del']:
            self._close_open_tag('strike')
        elif tag == 'sub':
            self._close_open_tag('sub')
        elif tag == 'sup':
            self._close_open_tag('sup')
        elif tag in ['span', 'font']:
            self._close_open_tag('font')

    def _close_open_tag(self, tag_name):
        for idx in range(len(self.open_tags) - 1, -1, -1):
            t, _ = self.open_tags[idx]
            if t == tag_name:
                self.open_tags.pop(idx)
                self.current_text.append(f'</{tag_name}>')
                break

    def handle_data(self, data):
        escaped = data.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        self.current_text.append(escaped)

    def _flush_paragraph(self):
        if self.current_text:
            text = ''.join(self.current_text).strip()
            for t, _ in reversed(self.open_tags):
                text += f'</{t}>'
            clean_text = re.sub(r'<[^>]+>', '', text).strip()
            clean_text = clean_text.replace('&amp;nbsp;', ' ').replace('&nbsp;', ' ').strip()
            if clean_text:
                self.paragraphs.append(text)
            self.current_text = []

    def get_paragraphs(self):
        self._flush_paragraph()
        return self.paragraphs


def format_ordinal_date(d):
    day = d.day
    if 11 <= day <= 13:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
    return f"{day}{suffix} {d.strftime('%B %Y')}"


def get_end_date(start_date, months):
    year = start_date.year + (start_date.month + months - 1) // 12
    month = (start_date.month + months - 1) % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    return datetime.date(year, month, last_day)


def generate_offer_letter(student):
    """
    Generates official Internship Offer Letter replicating Akash Technolabs format.
    Matches the official letterhead, header logo, watermark, stamp, signature,
    and verified company contact footer.
    """
    buffer = io.BytesIO()
    page_w, page_h = A4 # 595.28 x 841.89 pt
    c = canvas.Canvas(buffer, pagesize=A4)

    # 1. Header Logo Bar
    show_header = getattr(student, 'offer_letter_show_header', True)
    if show_header:
        header_path = None
        custom_header = getattr(student, 'offer_letter_header_image', None)
        if custom_header and hasattr(custom_header, 'path') and os.path.exists(custom_header.path):
            header_path = custom_header.path
        elif os.path.exists(os.path.join(ASSETS_DIR, 'header_logo.png')):
            header_path = os.path.join(ASSETS_DIR, 'header_logo.png')
        if header_path and os.path.exists(header_path):
            c.drawImage(header_path, 0.265, 773.552, width=594.75, height=53.338, mask='auto')

    # 2. Footer Bar (Website, Email, Phone, Address)
    show_footer = getattr(student, 'offer_letter_show_footer', True)
    if show_footer:
        footer_path = None
        custom_footer = getattr(student, 'offer_letter_footer_image', None)
        if custom_footer and hasattr(custom_footer, 'path') and os.path.exists(custom_footer.path):
            footer_path = custom_footer.path
        elif os.path.exists(os.path.join(ASSETS_DIR, 'footer.png')):
            footer_path = os.path.join(ASSETS_DIR, 'footer.png')
        if footer_path and os.path.exists(footer_path):
            c.drawImage(footer_path, 35.14, 12.148, width=525, height=35.102, mask='auto')
        else:
            footer_text = getattr(student, 'offer_letter_footer_text', '')
            if footer_text:
                c.setFont('Helvetica', 8)
                c.setFillColor(colors.HexColor('#64748B'))
                c.drawCentredString(page_w / 2, 22, footer_text)

    # 3. Translucent Watermark in Center Background ("benked off image")
    show_watermark = getattr(student, 'offer_letter_show_watermark', True)
    if show_watermark:
        watermark_path = None
        custom_bg = getattr(student, 'offer_letter_bg_image', None)
        if custom_bg and hasattr(custom_bg, 'path') and os.path.exists(custom_bg.path):
            watermark_path = custom_bg.path
        elif os.path.exists(os.path.join(ASSETS_DIR, 'watermark_faded.png')):
            watermark_path = os.path.join(ASSETS_DIR, 'watermark_faded.png')
        elif os.path.exists(os.path.join(ASSETS_DIR, 'watermark.png')):
            watermark_path = os.path.join(ASSETS_DIR, 'watermark.png')
        if watermark_path and os.path.exists(watermark_path):
            c.drawImage(watermark_path, 167.57, 264.588, width=260.14, height=260.14, mask='auto')

    # 4. Ref No & Date
    ref_val = getattr(student, 'offer_letter_ref_no', '')
    if not ref_val and getattr(student, 'id', None):
        ref_val = f"ATI/INT/{datetime.date.today().year}/{str(student.id).zfill(4)}"
    if ref_val:
        c.setFont('Helvetica', 12)
        c.setFillColor(colors.HexColor('#000000'))
        c.drawString(60, 738.7, f"Ref : {ref_val}")

    date_val = getattr(student, 'offer_letter_issue_date', None) or getattr(student, 'approved_at', None) or getattr(student, 'created_at', None) or timezone.now()
    if isinstance(date_val, str):
        try:
            date_val = datetime.date.fromisoformat(date_val)
        except:
            try:
                date_val = datetime.datetime.fromisoformat(date_val.replace('Z', '+00:00')).date()
            except:
                date_val = datetime.date.today()
    elif isinstance(date_val, datetime.datetime):
        date_val = date_val.date()
    date_str = f"Date : {date_val.strftime('%d-%m-%Y')}"
    c.setFont('Helvetica', 12)
    c.setFillColor(colors.HexColor('#000000'))
    c.drawRightString(page_w - 60, 738.7, date_str)

    # 5. Document Title
    c.setFont('Helvetica-Bold', 18)
    title_text = getattr(student, 'offer_letter_title', 'INTERNSHIP OFFER LETTER') or 'INTERNSHIP OFFER LETTER'
    c.drawCentredString(page_w / 2, 695.3, title_text)
    # Underline
    title_w = c.stringWidth(title_text, 'Helvetica-Bold', 18)
    c.setLineWidth(1.2)
    c.setStrokeColor(colors.HexColor('#000000'))
    c.line((page_w - title_w) / 2, 692, (page_w + title_w) / 2, 692)

    # Calculate dates & student details
    start_date = getattr(student, 'offer_letter_start_date', None) or getattr(student, 'internship_start_date', None) or datetime.date.today()
    if isinstance(start_date, str):
        try:
            start_date = datetime.date.fromisoformat(start_date)
        except:
            start_date = datetime.date.today()
    elif isinstance(start_date, datetime.datetime):
        start_date = start_date.date()

    duration = getattr(student, 'internship_duration_months', 6) or 6

    end_date = getattr(student, 'offer_letter_end_date', None)
    if not end_date:
        end_date = get_end_date(start_date, duration)
    elif isinstance(end_date, str):
        try:
            end_date = datetime.date.fromisoformat(end_date)
        except:
            end_date = get_end_date(start_date, duration)
    elif isinstance(end_date, datetime.datetime):
        end_date = end_date.date()

    start_date_str = format_ordinal_date(start_date)
    end_date_str = format_ordinal_date(end_date)

    full_name = getattr(student, 'full_name', 'Intern')
    user_salut = getattr(student, 'offer_letter_salutation', '')
    if user_salut:
        student_title = f"{user_salut} {full_name}".strip()
    else:
        salutation = "Mr." if not full_name.startswith(('Mr.', 'Ms.', 'Mrs.', 'Dr.')) else ""
        student_title = f"{salutation} {full_name}".strip()

    pronoun = (getattr(student, 'offer_letter_pronoun', 'he') or 'he').lower()
    subj_cap = 'He' if pronoun == 'he' else ('She' if pronoun == 'she' else 'They')
    subj_low = 'he' if pronoun == 'he' else ('she' if pronoun == 'she' else 'they')
    poss_cap = 'His' if pronoun == 'he' else ('Her' if pronoun == 'she' else 'Their')
    poss_low = 'his' if pronoun == 'he' else ('her' if pronoun == 'she' else 'their')
    obj = 'him' if pronoun == 'he' else ('her' if pronoun == 'she' else 'them')
    verb_be = 'is' if pronoun in ['he', 'she'] else 'are'

    tech = getattr(student, 'technology', 'AI/ML')
    role_title = getattr(student, 'offer_letter_role', None) or f"{tech} Intern"
    company_name = getattr(student, 'offer_letter_company_name', 'Akash Technolabs') or 'Akash Technolabs'

    # 6. Body Paragraphs (Justified, exact typography)
    body_style = ParagraphStyle(
        'AkashOfferBody',
        fontName='Helvetica',
        fontSize=12,
        leading=17.5,
        textColor=colors.HexColor('#000000'),
        alignment=4 # Justified
    )

    body_w = page_w - 120 # Left margin 60, right margin 60 = 475.28 pt

    import re

    def sanitize_xml(text):
        if not text:
            return ""
        return re.sub(r'&(?!(?:amp|lt|gt|quot|apos|nbsp);)', '&amp;', str(text))

    full_body = getattr(student, 'offer_letter_full_body', '').strip()
    if full_body:
        if '<' in full_body and '>' in full_body:
            try:
                cleaner = ReportLabHTMLCleaner()
                cleaner.feed(full_body)
                paras = cleaner.get_paragraphs()
                para_texts = paras if paras else [sanitize_xml(re.sub(r'<[^>]+>', '', full_body).strip())]
            except Exception:
                raw_paras = [p.strip() for p in re.split(r'\n\s*\n', full_body) if p.strip()]
                para_texts = [sanitize_xml(re.sub(r'<[^>]+>', '', p)) for p in raw_paras]
        else:
            raw_paras = [p.strip() for p in re.split(r'\n\s*\n', full_body) if p.strip()]
            para_texts = [sanitize_xml(p) for p in raw_paras if p.strip()]
    else:
        # Fallback to individual paragraphs or default templates
        p1_custom = getattr(student, 'offer_letter_p1', '').strip()
        if p1_custom:
            p1_text = sanitize_xml(p1_custom)
        else:
            p1_text = (
                f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is to inform that <b>{student_title}</b> has been selected for an internship at "
                f"<b>{company_name}</b> as a <b>{role_title}</b>. {poss_cap} internship will commence on <b>{start_date_str}</b> and continue until <b>{end_date_str}</b>."
            )

        p2_custom = getattr(student, 'offer_letter_p2', '').strip() or getattr(student, 'offer_letter_custom_text', '').strip()
        if p2_custom:
            p2_text = sanitize_xml(p2_custom)
        else:
            p2_text = (
                f"During the internship period, {subj_low} will work on {tech} technology and will be involved in "
                f"projects and assignments designed to enhance {poss_low} technical knowledge and practical skills. "
                f"{subj_cap} {verb_be} expected to maintain a professional attitude, follow the company\'s policies and guidelines, "
                f"and perform {poss_low} assigned responsibilities with sincerity and dedication throughout the internship."
            )

        p3_custom = getattr(student, 'offer_letter_p3', '').strip()
        if p3_custom:
            p3_text = sanitize_xml(p3_custom)
        else:
            p3_text = (
                f"Upon successful completion of the internship, {subj_low} will be awarded an <b>Internship Completion Certificate</b> "
                f"based on {poss_low} performance and adherence to the company\'s rules and regulations."
            )

        p4_custom = getattr(student, 'offer_letter_p4', '').strip()
        if p4_custom:
            p4_text = sanitize_xml(p4_custom)
        else:
            p4_text = (
                f"We are pleased to welcome {obj} to {company_name} and wish {obj} a successful and enriching internship experience."
            )
        para_texts = [p1_text, p2_text, p3_text, p4_text]

    # Dynamic vertical flow: Draw paragraphs smoothly from top to bottom
    curr_y = 650
    for idx, p_text in enumerate(para_texts):
        if idx == 0 and not p_text.startswith('&nbsp;') and not p_text.startswith(' '):
            p_text = f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{p_text}"
        try:
            p_obj = Paragraph(p_text, body_style)
        except Exception:
            clean_plain = re.sub(r'<[^>]+>', '', p_text).strip()
            clean_plain = sanitize_xml(clean_plain)
            p_obj = Paragraph(clean_plain, body_style)
        pw, ph = p_obj.wrap(body_w, 400)
        curr_y -= ph
        p_obj.drawOn(c, 60, curr_y)
        curr_y -= 14

    curr_y -= 8

    # 7. Sign-off, Official Stamp & Signatory Authorization
    alignment = (getattr(student, 'offer_letter_stamp_alignment', 'right') or 'right').lower()
    signoff = getattr(student, 'offer_letter_signoff', 'Sincerely') or 'Sincerely'
    sig_name = getattr(student, 'offer_letter_signatory_name', None) or 'Akash Padhiyar'
    sig_role = getattr(student, 'offer_letter_signatory_role', None) or 'CEO'

    show_stamp = getattr(student, 'offer_letter_show_stamp', True)
    stamp_path = None
    if show_stamp:
        custom_stamp = getattr(student, 'offer_letter_stamp_image', None)
        if custom_stamp and hasattr(custom_stamp, 'path') and os.path.exists(custom_stamp.path):
            stamp_path = custom_stamp.path
        elif os.path.exists(os.path.join(ASSETS_DIR, 'stamp.png')):
            stamp_path = os.path.join(ASSETS_DIR, 'stamp.png')

    # Vertical spacing between signoff, stamp & signature
    spacing_mode = (getattr(student, 'offer_letter_stamp_spacing', 'standard') or 'standard').lower()
    if spacing_mode == 'compact':
        gap_top = 12.0
        gap_bottom = 16.0
    elif spacing_mode == 'spacious':
        gap_top = 24.0
        gap_bottom = 28.0
    else: # 'standard'
        gap_top = 18.0
        gap_bottom = 22.0

    if alignment == 'right':
        # Align in right-hand column where signoff, stamp, and signatory share the exact same left anchor
        w_signoff = c.stringWidth(signoff, 'Helvetica', 12)
        w_name = c.stringWidth(sig_name, 'Helvetica-Bold', 12)
        w_role = c.stringWidth(sig_role, 'Helvetica', 12)
        max_text_w = max(w_signoff, w_name, w_role, 72.0)
        col_w = max(max_text_w, 125.0)
        x_block = (page_w - 60.0) - col_w
        stamp_x = x_block

        c.setFont('Helvetica', 12)
        c.drawString(x_block, curr_y, signoff)
        curr_y -= gap_top

        if show_stamp and stamp_path and os.path.exists(stamp_path):
            stamp_h = 61.6
            stamp_y = curr_y - stamp_h
            c.drawImage(stamp_path, stamp_x, stamp_y, width=72, height=stamp_h, mask='auto')
            curr_y = stamp_y - gap_bottom
        else:
            curr_y -= 32

        c.setFont('Helvetica-Bold', 12)
        c.drawString(x_block, curr_y, sig_name)
        curr_y -= 16
        c.setFont('Helvetica', 12)
        c.drawString(x_block, curr_y, sig_role)

    elif alignment == 'center':
        x_center = page_w / 2.0
        stamp_x = (page_w - 72.0) / 2.0

        c.setFont('Helvetica', 12)
        c.drawCentredString(x_center, curr_y, signoff)
        curr_y -= gap_top

        if show_stamp and stamp_path and os.path.exists(stamp_path):
            stamp_h = 61.6
            stamp_y = curr_y - stamp_h
            c.drawImage(stamp_path, stamp_x, stamp_y, width=72, height=stamp_h, mask='auto')
            curr_y = stamp_y - gap_bottom
        else:
            curr_y -= 32

        c.setFont('Helvetica-Bold', 12)
        c.drawCentredString(x_center, curr_y, sig_name)
        curr_y -= 16
        c.setFont('Helvetica', 12)
        c.drawCentredString(x_center, curr_y, sig_role)

    else: # 'left'
        x_left = 60.0
        stamp_x = 60.0

        c.setFont('Helvetica', 12)
        c.drawString(x_left, curr_y, signoff)
        curr_y -= gap_top

        if show_stamp and stamp_path and os.path.exists(stamp_path):
            stamp_h = 61.6
            stamp_y = curr_y - stamp_h
            c.drawImage(stamp_path, stamp_x, stamp_y, width=72, height=stamp_h, mask='auto')
            curr_y = stamp_y - gap_bottom
        else:
            curr_y -= 32

        c.setFont('Helvetica-Bold', 12)
        c.drawString(x_left, curr_y, sig_name)
        curr_y -= 16
        c.setFont('Helvetica', 12)
        c.drawString(x_left, curr_y, sig_role)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.getvalue()


def generate_certificate(student):
    """
    Generates verified Internship Completion Certificate matching Akash Technolabs official branding.
    Landscape A4 format with ornamental borders, watermark, and official seal.
    """
    buffer = io.BytesIO()
    # A4 Landscape
    page_w, page_h = 841.89, 595.27
    c = canvas.Canvas(buffer, pagesize=(page_w, page_h))

    # Translucent watermark in background
    watermark_path = os.path.join(ASSETS_DIR, 'watermark_faded.png')
    if not os.path.exists(watermark_path):
        watermark_path = os.path.join(ASSETS_DIR, 'watermark.png')
    if os.path.exists(watermark_path):
        c.drawImage(watermark_path, (page_w - 240) / 2, (page_h - 240) / 2, width=240, height=240, mask='auto')

    # Outer decorative navy border
    c.setStrokeColor(colors.HexColor('#1E3A8A'))
    c.setLineWidth(5)
    c.rect(20, 20, page_w - 40, page_h - 40)

    # Inner decorative gold border
    c.setStrokeColor(colors.HexColor('#D97706'))
    c.setLineWidth(1.5)
    c.rect(26, 26, page_w - 52, page_h - 52)

    # Organization Title
    c.setFillColor(colors.HexColor('#C81E1E')) # Red accent
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(page_w / 2, 515, "AKASH TECHNOLABS")

    c.setFillColor(colors.HexColor('#1E3A8A'))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(page_w / 2, 492, "CERTIFICATE OF INTERNSHIP COMPLETION")

    # Divider line
    c.setStrokeColor(colors.HexColor('#E5E7EB'))
    c.setLineWidth(1.2)
    c.line(160, 478, page_w - 160, 478)

    # Main text
    c.setFillColor(colors.HexColor('#4B5563'))
    c.setFont("Helvetica", 14)
    c.drawCentredString(page_w / 2, 440, "THIS IS PROUDLY PRESENTED TO")

    # Student Name
    c.setFillColor(colors.HexColor('#0F172A'))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(page_w / 2, 392, student.full_name.upper())

    # College & University
    c.setFillColor(colors.HexColor('#374151'))
    c.setFont("Helvetica", 13)
    c.drawCentredString(page_w / 2, 350, f"of {student.college_name}, {student.university}")

    # Internship Detail
    custom_title = getattr(student, 'certificate_program_title', None)
    if custom_title and custom_title.strip():
        p_detail = custom_title.strip()
    else:
        duration_m = getattr(student, 'internship_duration_months', 6) or 6
        p_detail = (
            f"for successfully completing the {duration_m}-Month Internship program "
            f"in {student.technology}"
        )
    c.drawCentredString(page_w / 2, 315, p_detail)

    # Dates
    start_date = getattr(student, 'certificate_start_date', None) or getattr(student, 'offer_letter_start_date', None) or getattr(student, 'internship_start_date', None) or datetime.date.today()
    if isinstance(start_date, str):
        try:
            start_date = datetime.date.fromisoformat(start_date)
        except Exception:
            start_date = datetime.date.today()
    start_date_str = format_ordinal_date(start_date)

    duration = getattr(student, 'internship_duration_months', 6) or 6
    end_date = getattr(student, 'certificate_end_date', None) or getattr(student, 'offer_letter_end_date', None) or get_end_date(start_date, duration)
    if isinstance(end_date, str):
        try:
            end_date = datetime.date.fromisoformat(end_date)
        except Exception:
            end_date = get_end_date(start_date, duration)
    end_date_str = format_ordinal_date(end_date)

    issue_date = getattr(student, 'certificate_issue_date', None) or datetime.date.today()
    if isinstance(issue_date, str):
        try:
            issue_date = datetime.date.fromisoformat(issue_date)
        except Exception:
            issue_date = datetime.date.today()
    issue_date_str = format_ordinal_date(issue_date)

    # Custom performance / appreciation text
    custom_remarks = getattr(student, 'certificate_custom_text', None)
    if not custom_remarks or not custom_remarks.strip():
        custom_remarks = "During this tenure, the intern demonstrated exceptional technical competence, diligence, and dedication."

    c.setFont("Helvetica-Oblique", 11)
    c.setFillColor(colors.HexColor('#6B7280'))
    c.drawCentredString(page_w / 2, 275, custom_remarks.strip())
    c.drawCentredString(
        page_w / 2, 255,
        f"Tenure: {start_date_str} to {end_date_str} | Date of Issue: {issue_date_str} | Ref: AT-CERT-{student.id:04d}"
    )

    # Signatures
    # Stamp on left
    stamp_path = os.path.join(ASSETS_DIR, 'stamp.png')
    if os.path.exists(stamp_path):
        c.drawImage(stamp_path, 155, 120, width=70, height=60, mask='auto')

    # Signature lines
    c.setStrokeColor(colors.HexColor('#9CA3AF'))
    c.setLineWidth(1)
    c.line(100, 115, 280, 115)
    c.line(page_w - 280, 115, page_w - 100, 115)

    sig1_name = getattr(student, 'certificate_signatory_name', None) or 'Akash Padhiyar'
    sig1_role = getattr(student, 'certificate_signatory_role', None) or 'CEO, Akash Technolabs'
    sig2_name = getattr(student, 'certificate_signatory_two_name', None) or 'Director of Technical Training'
    sig2_role = getattr(student, 'certificate_signatory_two_role', None) or 'Akash Technolabs'

    c.setFillColor(colors.HexColor('#1E293B'))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(190, 95, sig1_name)
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawCentredString(190, 80, sig1_role)

    c.setFillColor(colors.HexColor('#1E293B'))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(page_w - 190, 95, sig2_name)
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor('#64748B'))
    c.drawCentredString(page_w - 190, 80, sig2_role)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.getvalue()
