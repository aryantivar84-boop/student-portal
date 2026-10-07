import os
import io
import re
import datetime
import calendar
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from django.utils import timezone

ASSETS_DIR = os.path.join(os.path.dirname(__file__), 'assets')


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


def generate_offer_letter_docx(student):
    """
    Generates official Internship Offer Letter in Microsoft Word (.docx) format.
    Matches Akash Technolabs official branding: header banner, Ref No, Date,
    title, body paragraphs, closing, stamp/signature image, signatory, and footer banner.
    """
    doc = docx.Document()

    # Configure standard page margins (0.75 inches for letterhead)
    for section in doc.sections:
        section.top_margin = Inches(0.55)
        section.bottom_margin = Inches(0.55)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # 1. Header Banner Image
    show_header = getattr(student, 'offer_letter_show_header', True)
    if show_header:
        header_path = None
        custom_header = getattr(student, 'offer_letter_header_image', None)
        if custom_header and hasattr(custom_header, 'path') and os.path.exists(custom_header.path):
            header_path = custom_header.path
        elif os.path.exists(os.path.join(ASSETS_DIR, 'header_logo.png')):
            header_path = os.path.join(ASSETS_DIR, 'header_logo.png')

        if header_path and os.path.exists(header_path):
            p_hdr = doc.add_paragraph()
            p_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_hdr.paragraph_format.space_before = Pt(0)
            p_hdr.paragraph_format.space_after = Pt(14)
            p_hdr.add_run().add_picture(header_path, width=Inches(6.8))

    # 2. Ref No & Date
    ref_val = getattr(student, 'offer_letter_ref_no', '')
    if not ref_val and getattr(student, 'id', None):
        ref_val = f"ATI/INT/{datetime.date.today().year}/{str(student.id).zfill(4)}"

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
    date_str = date_val.strftime('%d-%m-%Y') if date_val else datetime.date.today().strftime('%d-%m-%Y')

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(4)
    p_meta.paragraph_format.space_after = Pt(14)
    p_meta.paragraph_format.tab_stops.add_tab_stop(Inches(6.8), WD_TAB_ALIGNMENT.RIGHT)

    r_ref = p_meta.add_run(f"Ref : {ref_val}")
    r_ref.font.name = 'Calibri'
    r_ref.font.size = Pt(11)
    r_ref.bold = True
    r_ref.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    r_tab = p_meta.add_run("\t")

    r_date = p_meta.add_run(f"Date : {date_str}")
    r_date.font.name = 'Calibri'
    r_date.font.size = Pt(11)
    r_date.bold = True
    r_date.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # 3. Document Title
    title_text = getattr(student, 'offer_letter_title', 'INTERNSHIP OFFER LETTER') or 'INTERNSHIP OFFER LETTER'
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(8)
    p_title.paragraph_format.space_after = Pt(20)

    r_title = p_title.add_run(title_text)
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(16)
    r_title.bold = True
    r_title.underline = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Student Details
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

    # 4. Body Paragraphs
    full_body = getattr(student, 'offer_letter_full_body', '').strip()
    if full_body:
        if '<' in full_body and '>' in full_body:
            clean_blocks = re.split(r'</?(?:p|div|h[1-6]|li|ul|ol)[^>]*>', full_body, flags=re.IGNORECASE)
            raw_paras = []
            for b in clean_blocks:
                b = re.sub(r'<[^>]+>', '', b).strip()
                b = b.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"').replace('&apos;', "'").strip()
                if b:
                    raw_paras.append(b)
        else:
            raw_paras = [p.strip() for p in re.split(r'\n\s*\n', full_body) if p.strip()]
        if not raw_paras and full_body:
            raw_paras = [re.sub(r'<[^>]+>', '', full_body).strip()]
    else:
        p1 = f"This is to inform that {student_title} has been selected for an internship at {company_name} as a {role_title}. {poss_cap} internship will commence on {start_date_str} and continue until {end_date_str}."
        p2 = (getattr(student, 'offer_letter_p2', '').strip() or getattr(student, 'offer_letter_custom_text', '').strip() or
              f"During the internship period, {subj_low} will work on {tech} technology and will be involved in projects and assignments designed to enhance {poss_low} technical knowledge and practical skills. {subj_cap} {verb_be} expected to maintain a professional attitude, follow the company's policies and guidelines, and perform {poss_low} assigned responsibilities with sincerity and dedication throughout the internship.")
        p3 = f"Upon successful completion of the internship, {subj_low} will be awarded an Internship Completion Certificate based on {poss_low} performance and adherence to the company's rules and regulations."
        p4 = f"We are pleased to welcome {obj} to {company_name} and wish {obj} a successful and enriching internship experience."
        raw_paras = [p1, p2, p3, p4]

    for p_idx, text_chunk in enumerate(raw_paras):
        p_body = doc.add_paragraph()
        p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_body.paragraph_format.space_before = Pt(0)
        p_body.paragraph_format.space_after = Pt(12)
        p_body.paragraph_format.line_spacing = 1.25

        # Format first paragraph indentation
        if p_idx == 0:
            p_body.paragraph_format.first_line_indent = Inches(0.35)

        run = p_body.add_run(text_chunk)
        run.font.name = 'Calibri'
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # 5. Sign-off closing
    signoff = getattr(student, 'offer_letter_signoff', 'Sincerely') or 'Sincerely'
    p_signoff = doc.add_paragraph()
    p_signoff.paragraph_format.space_before = Pt(8)
    p_signoff.paragraph_format.space_after = Pt(4)
    r_so = p_signoff.add_run(signoff)
    r_so.font.name = 'Calibri'
    r_so.font.size = Pt(11.5)
    r_so.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # 6. Official Stamp & Signature Image
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
        space_before_stamp = Pt(4)
        space_after_stamp = Pt(6)
    elif spacing_mode == 'spacious':
        space_before_stamp = Pt(14)
        space_after_stamp = Pt(18)
    else: # standard
        space_before_stamp = Pt(8)
        space_after_stamp = Pt(12)

    p_stamp = None
    if show_stamp and stamp_path and os.path.exists(stamp_path):
        p_stamp = doc.add_paragraph()
        p_stamp.paragraph_format.space_before = space_before_stamp
        p_stamp.paragraph_format.space_after = space_after_stamp
        p_stamp.add_run().add_picture(stamp_path, width=Inches(1.25))

    # 7. Signatory Name & Designation
    sig_name = getattr(student, 'offer_letter_signatory_name', 'Akash Padhiyar') or 'Akash Padhiyar'
    sig_role = getattr(student, 'offer_letter_signatory_role', 'CEO') or 'CEO'

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(0)
    p_sig.paragraph_format.space_after = Pt(18)
    p_sig.paragraph_format.line_spacing = 1.15

    r_signame = p_sig.add_run(f"{sig_name}\n")
    r_signame.font.name = 'Calibri'
    r_signame.font.size = Pt(11.5)
    r_signame.bold = True
    r_signame.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    r_sigrole = p_sig.add_run(f"{sig_role}\n{company_name}")
    r_sigrole.font.name = 'Calibri'
    r_sigrole.font.size = Pt(10.5)
    r_sigrole.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Set signatory block alignment (Left / Center / Right)
    alignment = (getattr(student, 'offer_letter_stamp_alignment', 'right') or 'right').lower()
    align_wd = WD_ALIGN_PARAGRAPH.RIGHT if alignment == 'right' else (WD_ALIGN_PARAGRAPH.CENTER if alignment == 'center' else WD_ALIGN_PARAGRAPH.LEFT)
    p_signoff.alignment = align_wd
    if p_stamp:
        p_stamp.alignment = align_wd
    p_sig.alignment = align_wd

    # 8. Footer Banner Image or Contact Line
    show_footer = getattr(student, 'offer_letter_show_footer', True)
    if show_footer:
        footer_path = None
        custom_footer = getattr(student, 'offer_letter_footer_image', None)
        if custom_footer and hasattr(custom_footer, 'path') and os.path.exists(custom_footer.path):
            footer_path = custom_footer.path
        elif os.path.exists(os.path.join(ASSETS_DIR, 'footer.png')):
            footer_path = os.path.join(ASSETS_DIR, 'footer.png')

        p_ftr = doc.add_paragraph()
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ftr.paragraph_format.space_before = Pt(14)
        p_ftr.paragraph_format.space_after = Pt(0)

        if footer_path and os.path.exists(footer_path):
            p_ftr.add_run().add_picture(footer_path, width=Inches(6.8))
        else:
            footer_text = getattr(student, 'offer_letter_footer_text', '') or f"{company_name} | Official Internship Verification"
            r_ftr = p_ftr.add_run(footer_text)
            r_ftr.font.name = 'Calibri'
            r_ftr.font.size = Pt(9)
            r_ftr.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()


def parse_offer_letter_docx(file_obj):
    """
    Parses an uploaded Microsoft Word (.docx) offer letter document.
    Extracts candidate name, Ref No, Date, full body paragraphs, sign-off, and signatory.
    Allows admins to edit the offer letter directly in Microsoft Word and import it back.
    """
    doc = docx.Document(file_obj)

    raw_paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    ref_no = ''
    issue_date = ''
    doc_title = ''
    body_paras = []
    signoff = ''
    sig_name = ''
    sig_role = ''

    # Known sign-off keywords
    signoff_keywords = ['sincerely', 'with best wishes', 'warm regards', 'for akash technolabs', 'yours faithfully', 'regards']

    in_body = False
    reached_signoff = False

    for text in raw_paragraphs:
        t_lower = text.lower()

        # Detect Ref No
        if 'ref :' in t_lower or 'ref:' in t_lower:
            m_ref = re.search(r'ref\s*:\s*([^\t\n]+)', text, re.IGNORECASE)
            if m_ref:
                ref_no = m_ref.group(1).strip()
            # Also check if Date is on the same line after tab
            if 'date :' in t_lower or 'date:' in t_lower:
                m_dt = re.search(r'date\s*:\s*([^\t\n]+)', text, re.IGNORECASE)
                if m_dt:
                    issue_date = m_dt.group(1).strip()
            continue

        # Detect standalone Date
        if ('date :' in t_lower or 'date:' in t_lower) and not issue_date:
            m_dt = re.search(r'date\s*:\s*([^\t\n]+)', text, re.IGNORECASE)
            if m_dt:
                issue_date = m_dt.group(1).strip()
            continue

        # Detect Title
        if 'internship offer letter' in t_lower or 'offer letter' in t_lower:
            doc_title = text
            in_body = True
            continue

        # Detect Sign-off
        if any(t_lower == kw or t_lower.startswith(kw) for kw in signoff_keywords):
            signoff = text.replace(',', '').strip()
            reached_signoff = True
            in_body = False
            continue

        if reached_signoff:
            # Paragraphs after signoff are signatory name / role
            if not sig_name:
                sig_lines = [l.strip() for l in text.split('\n') if l.strip()]
                if sig_lines:
                    sig_name = sig_lines[0]
                    if len(sig_lines) > 1:
                        sig_role = sig_lines[1]
            elif not sig_role:
                sig_role = text.split('\n')[0].strip()
            continue

        # If not header/meta and before signoff, it's a body paragraph
        # Skip if it's pure company footer url/phone
        if any(x in t_lower for x in ['www.', 'http', 'info@', 'akash technolabs |']):
            continue

        body_paras.append(text)

    # Standardize issue_date format to YYYY-MM-DD if possible
    formatted_date = ''
    if issue_date:
        for fmt in ('%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y', '%d %B %Y', '%B %d, %Y'):
            try:
                dt = datetime.datetime.strptime(issue_date, fmt).date()
                formatted_date = dt.isoformat()
                break
            except:
                pass

    return {
        'ref_no': ref_no,
        'issue_date': formatted_date or issue_date,
        'title': doc_title,
        'full_body': '\n\n'.join(body_paras).strip(),
        'paragraphs': body_paras,
        'signoff': signoff,
        'signatory_name': sig_name,
        'signatory_role': sig_role,
        'raw_count': len(body_paras),
    }
