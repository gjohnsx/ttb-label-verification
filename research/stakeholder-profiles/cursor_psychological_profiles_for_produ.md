# Psychological profiles for product design
_Exported on 1/24/2026 at 14:18:04 EST from Cursor (2.3.35)_

---

**User**

@ttb-label-verification/Take-Home Project_ AI-Powered Alcohol Label Verification App.md:1-138 make a psychological profile of everyone involved here. what are their needs? what are their expectations? what do we need to do especially for them? be thorough so we design the best product possible. 

---

**Cursor**

# Psychological Profiles: TTB Label Verification Stakeholders

## 1. Sarah Chen — Deputy Director of Label Compliance

### Background & Context
- **Role:** Middle management, decision-maker
- **Personal:** Mother with school-aged daughter, juggling work-life balance
- **Tenure:** Long enough to know institutional history ("before my time" re: 80s staffing), but not a 30-year veteran

### Psychological Profile

**Core Identity:** Sarah is a *pragmatic survivor*. She's watched her division shrink from 100+ agents to 47 while workload stayed constant. She's learned to work within constraints rather than fight them. Her casual mention of budget cuts ("you know how it goes") reveals someone who has internalized institutional limitations.

**Communication Style:** Warm, apologetic, context-heavy. She opened with an apology and personal detail about her daughter—she builds rapport before business. She's used to managing people, not systems.

**Hidden Frustration:** The phrase "It's not that they can't do more complex analysis, it's that they're drowning in routine stuff" reveals pride in her team's capabilities and frustration that they're underutilized. She wants her people doing meaningful work.

**Risk Posture:** *Burned before, cautious now.* The scanning vendor disaster is fresh. She prefaces technical requirements with war stories because she's seen enthusiasm turn to failure. Her 5-second requirement isn't arbitrary—it's scar tissue.

### Needs
| Need | Evidence | Priority |
|------|----------|----------|
| Speed (sub-5s response) | "If we can't get results back in about 5 seconds, nobody's going to use it" | **CRITICAL** |
| Simplicity for diverse users | "Something my mother could figure out" | **CRITICAL** |
| Batch processing | "Janet from our Seattle office has been asking about this for years" | HIGH |
| Political win | She needs this to work so she can justify modernization to leadership | HIDDEN |

### Expectations
- She expects this will probably fail or be limited (institutional cynicism)
- She expects to be the one explaining it to skeptical agents
- She expects clear demos she can show leadership

### Design Imperatives for Sarah
1. **Build confidence through speed**—show response times prominently
2. **Create a "Sarah demo"**—she needs ammunition to sell this upward and downward
3. **Batch upload isn't optional**—it's her credibility with remote offices
4. **Zero training required**—if she has to write a manual, we've failed

---

## 2. Marcus Williams — IT Systems Administrator

### Background & Context
- **Role:** Gatekeeper, infrastructure owner
- **Environment:** Post-migration Azure, FedRAMP-compliant, locked-down network
- **Trauma:** 18 months on FedRAMP paperwork, $4.2M failed modernization quote

### Psychological Profile

**Core Identity:** Marcus is a *defensive realist*. His entire job is preventing disasters while being blamed for inconvenience. His language is full of warnings: "don't get me started," "that went nowhere, obviously," "don't do anything crazy."

**Communication Style:** Technical but world-weary. He speaks in constraints, not possibilities. Coffee chat format suggests he's approachable but maintains professional distance.

**Protective Instinct:** He preemptively explains why things will be hard. The firewall blocking ML endpoints isn't a complaint—it's a warning. He's telling you what will kill the project before you hit it.

**Territory:** He carefully delineates what's his problem (infrastructure, security) from what isn't (COLA integration, future procurement). He's protecting his workload.

### Needs
| Need | Evidence | Priority |
|------|----------|----------|
| No security incidents | "There's PII considerations, document retention policies" | **CRITICAL** |
| No maintenance burden | "Standalone proof-of-concept" | **CRITICAL** |
| Clear boundaries | "We're not looking to integrate with COLA directly" | HIGH |
| CYA documentation | He needs to be able to point to decisions if things go wrong | HIDDEN |

### Expectations
- Expects the prototype will never go to production ("that's years away, realistically")
- Expects to be consulted on any infrastructure decisions
- Expects you'll probably hit network/security issues he warned about

### Design Imperatives for Marcus
1. **Minimize external dependencies**—every cloud API is a potential firewall fight
2. **Document security model clearly**—he needs to approve this
3. **Don't store anything sensitive**—he explicitly said this
4. **Keep it self-contained**—no database, no persistent storage, no integration points
5. **Include a simple architecture diagram**—he needs to explain this to security

---

## 3. Dave Morrison — Senior Compliance Agent (28 years)

### Background & Context
- **Role:** Subject matter expert, informal opinion leader
- **Tenure:** Clinton administration = started ~1996-2000
- **Format:** "Brief hallway conversation"—not fully engaged, skeptical of process

### Psychological Profile

**Core Identity:** Dave is an *institutional skeptic* with earned expertise. His 28 years mean he's seen every modernization wave crash. The 2008 phone system failure isn't trivia—it's his proof that new ≠ better.

**Communication Style:** Direct, slightly confrontational ("I'll be honest"), anecdote-driven. He speaks in case studies because that's how expertise is transmitted in his world. "I had one last week" is how he teaches.

**Defense Mechanism:** He establishes that the job requires "nuance" and "judgment" before technology is even discussed. This is identity protection—he needs to believe (correctly) that his expertise matters.

**The Real Tell:** "I'm not against new tools. If something can help me get through my queue faster, great." This is permission. Dave will adopt technology that *serves* him. He won't adopt technology that *replaces* him.

**Influence:** Brief hallway conversation format reveals he wasn't prioritized for formal interviews, but someone thought to include him. He's informal power—if Dave uses the tool, others will.

### Needs
| Need | Evidence | Priority |
|------|----------|----------|
| Respect for judgment | "You can't just pattern match everything... You need judgment" | **CRITICAL** |
| Queue throughput | "Help me get through my queue faster" | **CRITICAL** |
| Don't add complexity | "Don't make my life harder in the process" | HIGH |
| Tool, not replacement | Implicit—his identity is expertise | HIDDEN |

### Expectations
- Expects this will probably fail like past projects
- Expects rigid pattern matching that misses obvious cases
- Expects to be vindicated when the AI makes a stupid mistake

### Design Imperatives for Dave
1. **Never auto-reject**—the tool suggests, Dave decides
2. **Handle fuzzy matching gracefully**—"STONE'S THROW" vs "Stone's Throw" must NOT flag as error
3. **Show confidence levels**—let him apply judgment to edge cases
4. **Faster than eyeballing**—if it's slower, he'll abandon it instantly
5. **Win him early**—show the STONE'S THROW case in demos, prove you listened

---

## 4. Jenny Park — Junior Compliance Agent (8 months)

### Background & Context
- **Role:** End user, early adopter, potential internal champion
- **Tenure:** 8 months = still in "why do we do it this way?" phase
- **Format:** Teams call, Friday afternoon = eager to participate, fully engaged

### Psychological Profile

**Core Identity:** Jenny is a *frustrated optimizer*. She came from a world where "It's 2024!" means something. She has the technical literacy to have built this tool herself (Sarah's observation). She's waiting for the institution to catch up.

**Communication Style:** Enthusiastic, exclamatory, detailed. She uses "so excited" and "amazing"—emotional investment in outcomes. She gives specific examples (title case warning) because she's been thinking about this.

**Cognitive Advantage:** She's the only one who articulated a *systematic* view of the work: "Brand name—check with my eyes. ABV—check with my eyes." She sees the pattern, not just the cases.

**Reach:** She mentioned edge cases (weird angles, bad lighting, glare) that she explicitly knows might be "out of scope." She's managing expectations but also signaling ambition. She wants the full solution eventually.

**Risk:** Her enthusiasm could turn to disappointment if the tool is mediocre. She's the most likely to vocally criticize a bad implementation.

### Needs
| Need | Evidence | Priority |
|------|----------|----------|
| Automation of rote work | "I literally have a printed checklist" | **CRITICAL** |
| Strict warning validation | "It has to be exact. Like, word-for-word" | **CRITICAL** |
| Handle imperfect images | "Photographed at weird angles, bad lighting, glare" | MEDIUM |
| Feel heard | She's invested in being part of the solution | HIDDEN |

### Expectations
- Expects the tool to work well because she believes it's possible
- Expects strict validation (she's been trained on exactness)
- Expects modern UX patterns (she's digitally native)

### Design Imperatives for Jenny
1. **Nail the warning statement validation**—this is her litmus test
2. **Show the checklist model**—mirror her mental model (brand ✓, ABV ✓, warning ✓)
3. **Handle the exact warning requirements**—all caps "GOVERNMENT WARNING:", bold, word-for-word
4. **Add image quality feedback**—even if we can't fix bad images, tell users what's wrong
5. **Make her the internal champion**—she'll evangelize if it works

---

## Cross-Stakeholder Analysis

### The Adoption Curve

```
                    Jenny
                      ↓ (Day 1 adopter)
    ─────────────────────────────────────
                           Sarah
                             ↓ (Adopts if metrics prove value)
    ─────────────────────────────────────
                                    Dave
                                      ↓ (Adopts if it's faster & respects judgment)
    ─────────────────────────────────────
                                         Marcus
                                           ↓ (Doesn't use it, but must approve it)
```

### Conflicting Needs (Design Tensions)

| Tension | Resolution |
|---------|------------|
| Dave wants fuzzy matching / Jenny wants exact validation | **Both are right for different fields.** Brand names need fuzzy matching. Warning statements need exact matching. Build both. |
| Sarah wants batch upload / Dave wants control | **Batch upload + individual review.** Upload 200, review each in a queue. |
| Marcus wants isolation / Sarah wants results | **Client-side processing where possible.** Reduce server dependencies. |
| Dave distrusts AI / Jenny trusts AI | **Confidence indicators + human decision point.** Show the work, let humans decide. |

### Universal Requirements (Non-Negotiable)

1. **< 5 second response time** — mentioned by Sarah, implied by Dave's vendor pilot comments
2. **No training required** — "my mother could figure it out" / Dave "fighting with COLA"  
3. **Human remains decision-maker** — Dave's judgment, Jenny's exactness, Sarah's agents
4. **Visual clarity** — 50% of team is over 50, diverse tech comfort
5. **Warning statement accuracy** — Jenny's litmus test, legal requirement

### Hidden Stakeholders

1. **Janet (Seattle office)** — mentioned once, wants batch upload, represents remote users
2. **The 47 agents** — vary from Dave to Jenny, need to work for the whole spectrum
3. **Leadership** — unnamed, but Sarah needs to sell this to them
4. **Future auditors** — Marcus's security concerns suggest accountability matters

---

## Design Principles Derived from Profiles

### 1. **Assistive, Not Autonomous**
The tool *assists* the agent's decision. It never auto-approves or auto-rejects. This protects Dave's identity and meets compliance requirements.

### 2. **Speed as Feature**
Display processing time. Make sub-5s feel instant. If anything takes longer, show progress. The scanning vendor failed on speed—we cannot.

### 3. **Progressive Disclosure**
- Jenny sees: full detail, all fields, exact validation
- Dave sees: summary, flagged issues only, judgment calls highlighted
- Sarah sees: metrics, batch status, throughput numbers

### 4. **Explicit Confidence**
Show confidence scores for every extracted field. "Brand Name: OLD TOM DISTILLERY (98% confidence)" lets Dave apply judgment. "Warning Statement: EXACT MATCH" satisfies Jenny.

### 5. **Graceful Degradation**
Bad image? Don't crash. Say "Image quality may affect accuracy. Consider: [specific issues]." This addresses Jenny's edge cases without promising magic.

### 6. **Zero Infrastructure Burden**
Marcus approved a "standalone proof-of-concept." Honor that. Client-side where possible. No persistent storage. No COLA integration. No PII retention.

### 7. **Checklist Mental Model**
Jenny's printed checklist is the UX. Show:
- [ ] Brand Name — matches
- [ ] ABV — matches  
- [ ] Warning Statement — **MISMATCH** (details...)
- [ ] Net Contents — matches

This is how agents think. Mirror it.

---

## Stakeholder Success Metrics

| Stakeholder | They'll consider this a success if... |
|-------------|--------------------------------------|
| **Sarah** | Agents voluntarily use it; she can demo it to leadership; batch upload works |
| **Marcus** | Zero security incidents; no maintenance requests; clear documentation |
| **Dave** | It's faster than eyeballing; it handles fuzzy matching; he still decides |
| **Jenny** | Warning validation is perfect; it catches the things she catches; modern UX |

---

This analysis should inform every design decision. The core insight: **this tool succeeds only if Dave uses it.** Jenny will adopt anything. Sarah will mandate nothing without proof. Marcus just needs it to not break things. But if Dave—the 28-year skeptic with informal influence—adopts it voluntarily, the whole team will follow.

```plaintext
                    Jenny
                      ↓ (Day 1 adopter)
    ─────────────────────────────────────
                           Sarah
                             ↓ (Adopts if metrics prove value)
    ─────────────────────────────────────
                                    Dave
                                      ↓ (Adopts if it's faster & respects judgment)
    ─────────────────────────────────────
                                         Marcus
                                           ↓ (Doesn't use it, but must approve it)
```

---

**User**

what should i save this research as?

---

**Cursor**

Based on your project structure, I see you already have a `ttb-label-verification/research/` folder (with `uswds-treasury-design-standards.md` in it). 

I'd suggest:

```
ttb-label-verification/research/stakeholder-profiles.md
```

This keeps it:
- With your other research docs
- Named clearly for what it contains
- Easy to reference during design decisions

Want me to save it there?

```plaintext
ttb-label-verification/research/stakeholder-profiles.md
```

