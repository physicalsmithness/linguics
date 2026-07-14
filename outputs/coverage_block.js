  // ==================== 2D coverage matrix (topics x CEFR) ====================
  // See inter_chat/Architecture_Housing_coverage_matrix_2d. Shares masteryForScope
  // with the competence strip, so the two are identical in formula and colour.
  let coverageTransposed = false;

  function friendlyTopicLabel(id) {
    if (id.indexOf("verb_form.") === 0 || id === "tense_choice") return tenseLabel(id);
    const b = bucketIndex.byId[id];
    return (b && b.label) ? b.label : prettifyId(id);
  }
  function grammarTopicRows() {
    const roots = bucketIndex.roots.map(r => r.id).filter(id => overviewCategoryFor(id) !== null);
    roots.sort((a, b) => {
      const ca = OVERVIEW_CATEGORY_ORDER.indexOf(overviewCategoryFor(a));
      const cb = OVERVIEW_CATEGORY_ORDER.indexOf(overviewCategoryFor(b));
      if (ca !== cb) return ca - cb;
      return verbCurriculumRank(a) - verbCurriculumRank(b);
    });
    return roots.map(id => ({ id, label: friendlyTopicLabel(id), part: overviewCategoryFor(id) }));
  }

  function showCoverage() {
    document.body.classList.add("coverage-active");
    const el = document.getElementById("coverage-view");
    if (el) el.hidden = false;
    renderCoverage();
  }
  function hideCoverage() {
    document.body.classList.remove("coverage-active");
    const el = document.getElementById("coverage-view");
    if (el) el.hidden = true;
  }
  LL.showCoverage = showCoverage;

  function coverageDrill(topicId, level) {
    const li = CEFR_ORDER.indexOf(level);
    grammarFilter.clauses = [{ topics: [topicId] }];
    grammarFilter.cefrRange = [li, li];
    grammarFilter.topic = ""; grammarFilter.cefr = ""; grammarFilter.bucketPath = "";
    grammarDeck = []; grammarIndex = 0;
    hideCoverage();
    track("coverage_drill", { topic: topicId, level: level });
    renderGrammarFilterBar();
    renderGrammar();
    showStrand("grammar");
  }

  function renderCoverage() {
    const host = document.getElementById("coverage-view");
    if (!host) return;
    host.innerHTML = "";
    const col = document.createElement("div");
    col.className = "coverage-col";

    const bar = document.createElement("div");
    bar.className = "coverage-bar";
    const back = document.createElement("button");
    back.type = "button"; back.className = "coverage-back"; back.textContent = "← Back";
    back.addEventListener("click", () => { hideCoverage(); showEntry(); });
    const title = document.createElement("h2");
    title.className = "coverage-title"; title.textContent = "Your coverage";
    const trBtn = document.createElement("button");
    trBtn.type = "button"; trBtn.className = "coverage-transpose"; trBtn.textContent = "Transpose";
    trBtn.title = "Swap the axes";
    trBtn.addEventListener("click", () => { coverageTransposed = !coverageTransposed; renderCoverage(); });
    bar.appendChild(back); bar.appendChild(title); bar.appendChild(trBtn);
    col.appendChild(bar);

    const sub = document.createElement("p");
    sub.className = "coverage-sub";
    sub.textContent = "Fill shows how much you've practised; colour shows how you're doing. Tap a cell to drill in.";
    col.appendChild(sub);

    const topics = grammarTopicRows();
    const levels = CEFR_ORDER.map(l => ({ level: l, label: l }));
    const rowAxis = coverageTransposed ? levels : topics;
    const colAxis = coverageTransposed ? topics : levels;

    const scroll = document.createElement("div");
    scroll.className = "coverage-scroll" + (coverageTransposed ? " wide" : "");
    const table = document.createElement("table");
    table.className = "coverage-matrix";

    const thead = document.createElement("thead");
    const htr = document.createElement("tr");
    htr.appendChild(document.createElement("th"));
    for (const c of colAxis) {
      const th = document.createElement("th");
      th.textContent = c.label;
      htr.appendChild(th);
    }
    thead.appendChild(htr); table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const r of rowAxis) {
      const tr = document.createElement("tr");
      const rh = document.createElement("th");
      rh.className = "coverage-rowhead";
      rh.textContent = r.label;
      tr.appendChild(rh);
      for (const c of colAxis) {
        const topic = coverageTransposed ? c : r;
        const level = coverageTransposed ? r.level : c.level;
        const td = document.createElement("td");
        td.className = "coverage-cell";
        const m = masteryForScope([topic.id], level);
        if (m.empty) {
          td.classList.add("coverage-na");
          td.title = topic.label + " · " + level + ": not in scope at this level";
        } else {
          const fill = document.createElement("div");
          fill.className = "coverage-fill";
          fill.style.height = Math.round(m.attempted_share * 100) + "%";
          fill.style.background = rwgColour(m.correctness, m.hasEvents);
          td.appendChild(fill);
          td.title = topic.label + " · " + level + ": "
            + (m.hasEvents ? Math.round(m.correctness * 100) + "% over " + m.touched + "/" + m.total + " areas practised"
                           : m.total + " areas, none practised yet");
          td.addEventListener("click", () => coverageDrill(topic.id, level));
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    scroll.appendChild(table);
    col.appendChild(scroll);
    host.appendChild(col);
  }

