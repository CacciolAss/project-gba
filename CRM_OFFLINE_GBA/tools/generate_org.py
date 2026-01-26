#!/usr/bin/env python3
# Generates org.js from ORGANIGRAMMA.xlsx (sheet 1)
# Usage: python generate_org.py /path/to/ORGANIGRAMMA.xlsx /path/to/org.js
import sys, re, json, datetime
import pandas as pd
import numpy as np

def norm_name(v):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return None
    s = str(v).strip()
    if not s or s.lower() == "nan":
        return None
    s = re.sub(r"\s+", " ", s).strip().strip(",")
    return s.upper()

RANK = {"CONSULENTE": 1, "AFFIANCATORE": 2, "TEAM_LEADER": 3, "ADMIN": 4}

def set_role(role_by, user, role):
    if not user:
        return
    cur = role_by.get(user)
    if cur is None or RANK[role] > RANK[cur]:
        role_by[user] = role

def main(xlsx_path, out_js_path):
    df = pd.read_excel(xlsx_path, sheet_name=0, header=None)
    # Expected header row at index 1; data starts from index 2
    rows = []
    last_admin = None
    last_tl = None
    for i in range(2, len(df)):
        admin = norm_name(df.iat[i, 0])
        tl = norm_name(df.iat[i, 1])
        aff = norm_name(df.iat[i, 2])  # NO fill-down by design
        cons = norm_name(df.iat[i, 3])

        if admin:
            last_admin = admin
        else:
            admin = last_admin

        if tl:
            last_tl = tl
        else:
            tl = last_tl

        if admin is None and tl is None and aff is None and cons is None:
            continue

        rows.append((admin, tl, aff, cons))

    role_by = {}
    reports_to = {}
    assigned_assistant = {}

    for admin, tl, aff, cons in rows:
        if admin:
            set_role(role_by, admin, "ADMIN")
            reports_to.setdefault(admin, None)

        if tl:
            set_role(role_by, tl, "TEAM_LEADER")
            # TL reports to ADMIN
            if tl not in reports_to or reports_to[tl] is None:
                reports_to[tl] = admin

        if aff:
            set_role(role_by, aff, "AFFIANCATORE")

        if cons:
            set_role(role_by, cons, "CONSULENTE")
            # CONSULENTE reports to TEAM_LEADER
            reports_to[cons] = tl
            if aff:
                assigned_assistant[cons] = aff

    global_assistants = list(filter(None, map(norm_name, [
        "GIACOMELLI ALESSIO",
        "CAROSELLA MARCO",
        "PROVENZANO CLAUDIO",
        "NINCHERI MATTEO",
    ])))
    for g in global_assistants:
        set_role(role_by, g, "AFFIANCATORE")

    meta = {
        "generatedAt": datetime.datetime.now().isoformat(timespec="seconds"),
        "source": xlsx_path,
        "counts": {
            "users": len(role_by),
            "admins": sum(1 for r in role_by.values() if r == "ADMIN"),
            "teamLeaders": sum(1 for r in role_by.values() if r == "TEAM_LEADER"),
            "affiancatori": sum(1 for r in role_by.values() if r == "AFFIANCATORE"),
            "consulenti": sum(1 for r in role_by.values() if r == "CONSULENTE"),
            "assignedAssistants": len(assigned_assistant),
            "globalAssistants": len(global_assistants),
        },
    }

    def js_obj(d):
        return json.dumps(d, ensure_ascii=False, indent=2)

    js = f"""// AUTO-GENERATED FILE — do not edit by hand.
// Generated from {xlsx_path} at {meta['generatedAt']}

export const ORG_META = {js_obj(meta)};

export const ROLE_BY_USER_ID = {js_obj(role_by)};

export const REPORTS_TO_BY_USER_ID = {js_obj(reports_to)};

export const ASSIGNED_ASSISTANT_BY_OWNER_ID = {js_obj(assigned_assistant)};

export const GLOBAL_ASSISTANTS = {js_obj(sorted(global_assistants))};

export function normalizeUserId(v) {{
  return (v ?? "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\\s+/g, " ")
    .replace(/,+$/g, "");
}}

export function getRole(userId) {{
  return ROLE_BY_USER_ID[normalizeUserId(userId)] || null;
}}

export function getManager(userId) {{
  const id = normalizeUserId(userId);
  return REPORTS_TO_BY_USER_ID[id] || null;
}}

export function isGlobalAssistant(userId) {{
  const id = normalizeUserId(userId);
  return GLOBAL_ASSISTANTS.includes(id);
}}

export function getAssignedAssistant(ownerId) {{
  const id = normalizeUserId(ownerId);
  return ASSIGNED_ASSISTANT_BY_OWNER_ID[id] || null;
}}
"""
    with open(out_js_path, "w", encoding="utf-8") as f:
        f.write(js)

    print("Wrote:", out_js_path)
    print("Users:", meta["counts"]["users"], "Assigned assistants:", meta["counts"]["assignedAssistants"])

if __name__ == "__main__":
    xlsx = sys.argv[1] if len(sys.argv) > 1 else "ORGANIGRAMMA.xlsx"
    out = sys.argv[2] if len(sys.argv) > 2 else "org.js"
    main(xlsx, out)
