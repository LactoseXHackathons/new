import pypdf
import re
import json
import os
import sys
import time

PDF_PATH = "2025ENGG_CAP1_CutOff.pdf"
OUTPUT_PATH = os.path.join("src", "data", "cutoffData.json")
SUMMARY_PATH = os.path.join("src", "data", "cutoffSummary.json")

CITIES_KEYWORDS = [
    ("Navi Mumbai", ["navi mumbai", "vashi", "nerul", "kharghar", "belapur", "panvel"]),
    ("Mumbai", ["mumbai", "matunga", "wadala", "andheri", "bandra", "kandivali", "borivali", "dadar", "vile parle", "chembur", "sion", "kurla", "ghatkopar", "bhandup", "mulund", "thane", "kalyan", "dombivli", "mira bhayandar", "virar", "vasai", "palghar"]),
    ("Pune", ["pune", "pimpr", "chinchwad", "akurdi", "hadapsar", "wagholi", "tathawade", "vadgaon", "narhe", "karve", "kothrud", "alandi", "lohegaon", "bavdhan", "shivajinagar", "kondhwa", "dhayari", "baramati", "daund", "lavale"]),
    ("Nagpur", ["nagpur", "ramtek", "hingna", "wardha", "bhandara", "gondia", "chandrapur", "gadchiroli"]),
    ("Nashik", ["nashik", "nasik", "panchavati", "malegaon", "yeola"]),
    ("Chhatrapati Sambhajinagar", ["aurangabad", "sambhajinagar", "chhatrapati sambhajinagar", "jalna", "beed", "osmanabad", "dharashiv"]),
    ("Amravati", ["amravati", "akola", "buldhana", "yavatmal", "washim", "khamgaon", "shegaon"]),
    ("Kolhapur", ["kolhapur", "ichalkaranji", "jaysingpur"]),
    ("Sangli", ["sangli", "miraj", "ashta", "walchandnagar", "islampur"]),
    ("Satara", ["satara", "karad", "wai", "phaltan"]),
    ("Solapur", ["solapur", "pandharpur", "barshi"]),
    ("Nanded", ["nanded", "latur", "parbhani", "hingoli"]),
    ("Ahmednagar", ["ahmednagar", "ahilyanagar", "loni", "sangamner", "kopargaon", "pravaranagar", "shirdi"]),
    ("Jalgaon", ["jalgaon", "bhusawal", "chalisgaon", "dhule", "nandurbar"]),
    ("Ratnagiri", ["ratnagiri", "chiplun", "sindhudurg", "kankavli", "sawantwadi"]),
]

REGION_BY_CODE = {
    '1': 'Amravati Division',
    '2': 'Chhatrapati Sambhajinagar / Nanded Division',
    '3': 'Mumbai & Konkan Division',
    '4': 'Nagpur Division',
    '5': 'Nashik & North Maharashtra Division',
    '6': 'Pune & Western Maharashtra Division',
}

def detect_city(college_name, college_code):
    lower = college_name.lower()
    for city, keywords in CITIES_KEYWORDS:
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', lower):
                return city
    
    first_char = college_code.lstrip('0')[:1] if college_code.lstrip('0') else college_code[:1]
    if college_code.startswith('01') or college_code.startswith('1'):
        return "Amravati"
    elif college_code.startswith('02') or college_code.startswith('2'):
        return "Chhatrapati Sambhajinagar"
    elif college_code.startswith('03') or college_code.startswith('3'):
        return "Mumbai"
    elif college_code.startswith('04') or college_code.startswith('4'):
        return "Nagpur"
    elif college_code.startswith('05') or college_code.startswith('5'):
        return "Nashik"
    elif college_code.startswith('06') or college_code.startswith('6'):
        return "Pune"
    return "Other Maharashtra"

def clean_course_name(name):
    name = re.sub(r'\s+', ' ', name).strip()
    name = re.sub(r'Status:.*$', '', name).strip()
    return name

def main():
    print(f"Reading PDF from {PDF_PATH}...")
    start_time = time.time()
    reader = pypdf.PdfReader(PDF_PATH)
    total_pages = len(reader.pages)
    print(f"Total pages: {total_pages}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    colleges_dict = {}
    total_courses_count = 0

    current_college_code = None
    current_college_name = None
    current_college_status = None
    current_home_univ = None

    for page_idx in range(total_pages):
        if (page_idx + 1) % 150 == 0 or page_idx == total_pages - 1:
            elapsed = time.time() - start_time
            print(f"Processed {page_idx + 1}/{total_pages} pages ({((page_idx + 1)/total_pages)*100:.1f}%) in {elapsed:.1f}s...")

        text = reader.pages[page_idx].extract_text()
        if not text:
            continue

        # Check for college header
        col_m = re.search(r'(\d{5})\s*-\s*([^\n]+)', text)
        if col_m:
            current_college_code = col_m.group(1).strip()
            current_college_name = re.sub(r'\s+', ' ', col_m.group(2)).strip()

        # Split page by courses: 10-digit code followed by dash and name
        course_splits = re.split(r'(\d{10}\s*-\s*[^\n]+)', text)
        
        if len(course_splits) <= 1:
            continue

        for i in range(1, len(course_splits), 2):
            header = course_splits[i].strip()
            body = course_splits[i+1]

            c_header_m = re.match(r'(\d{10})\s*-\s*(.*)', header)
            if not c_header_m:
                continue

            course_code = c_header_m.group(1).strip()
            raw_course_name = c_header_m.group(2).strip()

            derived_college_code = course_code[:5]
            if not current_college_code or (derived_college_code != current_college_code and derived_college_code in colleges_dict):
                current_college_code = derived_college_code
            elif derived_college_code != current_college_code:
                current_college_code = derived_college_code
                if not current_college_name:
                    current_college_name = f"Institute {derived_college_code}"

            # Extract status and Home University
            status_m = re.search(r'Status:\s*([^\n]+?)(?:Home University\s*:\s*([^\n]+))?(?:\n|$)', body)
            course_status = status_m.group(1).strip() if status_m and status_m.group(1) else (current_college_status or "Un-Aided")
            home_univ = status_m.group(2).strip() if status_m and status_m.group(2) else (current_home_univ or "")

            course_name = clean_course_name(raw_course_name)

            cutoffs = {}
            scores = re.findall(r'(\d+)\s*\n\s*\(([\d\.]+)\)', body)
            
            sections = re.split(r'(State Level|Home University Seats Allotted to Home University Candidates|Home University Seats Allotted to Other Than Home University Candidates|Other Than Home University Seats Allotted to Other Than Home University Candidates)', body)
            
            if len(sections) > 1:
                for s_idx in range(1, len(sections), 2):
                    sec_type = sections[s_idx].strip()
                    sec_content = sections[s_idx+1]
                    
                    cat_header_m = re.search(r'([A-Z0-9\s\n]+?)\s+I\s+(\d+)', sec_content)
                    if cat_header_m:
                        raw_cats_str = cat_header_m.group(1)
                        cleaned_cats_str = re.sub(r'([A-Z0-9]+)\n([A-Z0-9]+)', r'\1\2', raw_cats_str)
                        cat_tokens = [t.strip() for t in re.split(r'\s+', cleaned_cats_str) if t.strip() and re.match(r'^[A-Z0-9]+$', t.strip())]
                        
                        sec_scores = re.findall(r'(\d+)\s*\n\s*\(([\d\.]+)\)', sec_content)
                        
                        for idx, (rk, pct) in enumerate(sec_scores):
                            if idx < len(cat_tokens):
                                cat_name = cat_tokens[idx]
                                cutoffs[cat_name] = {
                                    "rank": int(rk),
                                    "percentile": round(float(pct), 4),
                                    "section": sec_type
                                }
            else:
                for idx, (rk, pct) in enumerate(scores):
                    cutoffs[f"CAT_{idx+1}"] = {
                        "rank": int(rk),
                        "percentile": round(float(pct), 4),
                        "section": "State Level"
                    }

            # Map common category percentiles
            best_open = None
            best_obc = None
            best_sc = None
            best_st = None
            best_sebc = None
            best_ews = None
            best_tfws = None
            best_lopen = None

            for cat, data in cutoffs.items():
                pct = data["percentile"]
                c_upper = cat.upper()
                if "OPEN" in c_upper and not "LOPEN" in c_upper and not "PWD" in c_upper and not "DEF" in c_upper:
                    if best_open is None or pct > best_open["percentile"]:
                        best_open = data
                if "LOPEN" in c_upper:
                    if best_lopen is None or pct > best_lopen["percentile"]:
                        best_lopen = data
                if "OBC" in c_upper and not "PWD" in c_upper and not "DEF" in c_upper:
                    if best_obc is None or pct > best_obc["percentile"]:
                        best_obc = data
                if "SC" in c_upper and not "PWD" in c_upper and not "DEF" in c_upper:
                    if best_sc is None or pct > best_sc["percentile"]:
                        best_sc = data
                if "ST" in c_upper and not "PWD" in c_upper and not "DEF" in c_upper:
                    if best_st is None or pct > best_st["percentile"]:
                        best_st = data
                if "SEBC" in c_upper and not "DEF" in c_upper:
                    if best_sebc is None or pct > best_sebc["percentile"]:
                        best_sebc = data
                if "EWS" in c_upper:
                    if best_ews is None or pct > best_ews["percentile"]:
                        best_ews = data
                if "TFWS" in c_upper:
                    if best_tfws is None or pct > best_tfws["percentile"]:
                        best_tfws = data

            normalized_cutoffs = {
                "OPEN": best_open["percentile"] if best_open else (best_lopen["percentile"] if best_lopen else None),
                "OBC": best_obc["percentile"] if best_obc else None,
                "SC": best_sc["percentile"] if best_sc else None,
                "ST": best_st["percentile"] if best_st else None,
                "SEBC": best_sebc["percentile"] if best_sebc else None,
                "EWS": best_ews["percentile"] if best_ews else None,
                "TFWS": best_tfws["percentile"] if best_tfws else None,
                "LOPEN": best_lopen["percentile"] if best_lopen else None,
            }

            if current_college_code not in colleges_dict:
                city = detect_city(current_college_name or "", current_college_code)
                colleges_dict[current_college_code] = {
                    "code": current_college_code,
                    "name": current_college_name or f"Institute {current_college_code}",
                    "city": city,
                    "region": REGION_BY_CODE.get(current_college_code.lstrip('0')[:1], "Maharashtra"),
                    "status": course_status,
                    "homeUniversity": home_univ,
                    "courses": []
                }

            course_entry = {
                "code": course_code,
                "name": course_name,
                "status": course_status,
                "normalizedCutoffs": normalized_cutoffs,
                "rawCutoffs": cutoffs
            }

            existing = next((c for c in colleges_dict[current_college_code]["courses"] if c["code"] == course_code), None)
            if existing:
                existing["rawCutoffs"].update(cutoffs)
            else:
                colleges_dict[current_college_code]["courses"].append(course_entry)
                total_courses_count += 1

    colleges_list = list(colleges_dict.values())
    
    print(f"\nExtraction completed in {time.time() - start_time:.2f}s!")
    print(f"Total Colleges extracted: {len(colleges_list)}")
    print(f"Total Courses / Branches extracted: {total_courses_count}")

    cities_count = {}
    for col in colleges_list:
        city = col["city"]
        cities_count[city] = cities_count.get(city, 0) + 1

    print("\nColleges by City:")
    for city, cnt in sorted(cities_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {city}: {cnt} colleges")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(colleges_list, f, indent=None, ensure_ascii=False)

    summary = {
        "totalColleges": len(colleges_list),
        "totalCourses": total_courses_count,
        "totalPagesProcessed": total_pages,
        "cities": cities_count,
        "extractedAt": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"\nSaved data to {OUTPUT_PATH} (size: {os.path.getsize(OUTPUT_PATH) / (1024*1024):.2f} MB)")
    print(f"Saved summary to {SUMMARY_PATH}")

if __name__ == "__main__":
    main()
