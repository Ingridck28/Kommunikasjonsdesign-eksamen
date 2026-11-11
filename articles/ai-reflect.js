/*
  «Menneske eller maskin?»
  Local reflection module for the technology article only.
  Answers stay in memory and are never sent anywhere.
*/

(function () {
  const reflect = document.querySelector("[data-ai-reflect]");

  if (!reflect) {
    return;
  }

  const steps = Array.from(reflect.querySelectorAll("[data-reflect-step]"));
  const progress = reflect.querySelector("[data-reflect-progress]");
  const result = reflect.querySelector("[data-reflect-result]");
  const summary = reflect.querySelector("[data-reflect-summary]");
  const recap = reflect.querySelector("[data-reflect-recap]");
  const labels = {
    human: "Mennesket",
    ai: "AI",
    both: "Samarbeid mellom begge"
  };
  const answers = [];
  let index = 0;
  let locked = false;

  reflect.setAttribute("data-ready", "true");

  function updateProgress() {
    if (!progress) {
      return;
    }

    if (result && !result.hidden) {
      progress.textContent = "Oppsummering";
      return;
    }

    progress.textContent = index + 1 + " av " + steps.length;
  }

  function showStep(nextIndex) {
    index = nextIndex;
    locked = false;

    steps.forEach(function (step, stepIndex) {
      const active = stepIndex === index;
      step.hidden = !active;
      step.classList.toggle("is-active", active);

      if (!active) {
        return;
      }

      Array.from(step.querySelectorAll(".ai-reflect-option")).forEach(function (option) {
        option.setAttribute("aria-pressed", "false");
        option.disabled = false;
      });
    });

    if (result) {
      result.hidden = true;
    }

    updateProgress();
  }

  function buildSummary(values) {
    const counts = { human: 0, ai: 0, both: 0 };

    values.forEach(function (value) {
      if (counts[value] !== undefined) {
        counts[value] += 1;
      }
    });

    if (counts.both === values.length) {
      return "Du ser for deg et tett samarbeid gjennom hele kampanjen – der menneske og AI utfyller hverandre.";
    }

    if (counts.human === values.length) {
      return "Du legger hovedvekten på menneskelig vurdering i alle ledd av kampanjearbeidet.";
    }

    if (counts.ai === values.length) {
      return "Du er åpen for å la AI ta stor plass i kampanjearbeidet – fra tekst til beslutninger.";
    }

    if (counts.both >= 2) {
      return "Du lener deg mest mot samarbeid, men skiller fortsatt mellom oppgaver der mennesket eller AI kan gå foran.";
    }

    if (counts.human >= 2) {
      return "Du prioriterer menneskelig kontroll i flere deler av kampanjen, og bruker AI mer selektivt.";
    }

    if (counts.ai >= 2) {
      return "Du ser et større rom for AI i kampanjearbeidet, men beholder mennesket i enkelte nøkkelvalg.";
    }

    return "Valgene dine er blandet – du tilpasser hvem som bør styre ut fra oppgaven, ikke etter én fast modell.";
  }

  function showResult() {
    steps.forEach(function (step) {
      step.hidden = true;
      step.classList.remove("is-active");
    });

    if (summary) {
      summary.textContent = buildSummary(answers);
    }

    if (recap) {
      recap.innerHTML = "";

      steps.forEach(function (step, stepIndex) {
        const question = step.querySelector(".ai-reflect-question");
        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = question ? question.textContent : "Spørsmål " + (stepIndex + 1);
        item.appendChild(title);
        item.appendChild(
          document.createTextNode(labels[answers[stepIndex]] || answers[stepIndex] || "")
        );
        recap.appendChild(item);
      });
    }

    if (result) {
      result.hidden = false;
    }

    updateProgress();
  }

  function choose(option) {
    if (locked || !option || option.disabled) {
      return;
    }

    const step = steps[index];

    if (!step || !step.contains(option)) {
      return;
    }

    locked = true;
    const options = Array.from(step.querySelectorAll(".ai-reflect-option"));

    options.forEach(function (item) {
      item.setAttribute("aria-pressed", String(item === option));
      item.disabled = true;
    });

    answers[index] = option.getAttribute("data-value");

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 220;

    window.setTimeout(function () {
      if (index < steps.length - 1) {
        showStep(index + 1);
      } else {
        showResult();
      }
    }, delay);
  }

  reflect.addEventListener("click", function (event) {
    const option = event.target.closest(".ai-reflect-option");

    if (option) {
      choose(option);
      return;
    }

    if (event.target.closest("[data-reflect-retry]")) {
      answers.length = 0;
      showStep(0);
    }
  });

  showStep(0);
})();
