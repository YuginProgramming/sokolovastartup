import { questions } from "../quiz/questions.js";
import { evidencePhrase, scoreQuiz } from "../quiz/score.js";
import { anketaUrl } from "../quiz/types.js";
import { openOutside, prepareTelegram, telegramFirstName } from "./telegram.js";

type Answers = Record<string, string>;

type State =
  | { screen: "intro" }
  | { screen: "question"; index: number; answers: Answers }
  | { screen: "result"; answers: Answers };

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("#app is missing");

let state: State = { screen: "intro" };
let step = 0;

prepareTelegram();
draw();

function draw(): void {
  if (state.screen === "intro") root!.innerHTML = introHtml();
  if (state.screen === "question") root!.innerHTML = questionHtml(state.index, state.answers);
  if (state.screen === "result") root!.innerHTML = resultHtml(state.answers);
  bind();
  window.scrollTo(0, 0);
}

function bind(): void {
  root!.querySelector("[data-start]")?.addEventListener("click", () => {
    step += 1;
    state = { screen: "question", index: 0, answers: {} };
    draw();
  });

  root!.querySelector("[data-back]")?.addEventListener("click", () => {
    if (state.screen !== "question") return;
    step += 1;
    if (state.index === 0) {
      state = { screen: "intro" };
    } else {
      state = { screen: "question", index: state.index - 1, answers: state.answers };
    }
    draw();
  });

  root!.querySelectorAll<HTMLButtonElement>("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.screen !== "question") return;
      const question = questions[state.index];
      const answers = { ...state.answers, [question.id]: button.dataset.option || "" };
      const current = ++step;
      button.classList.add("is-on");
      window.setTimeout(() => {
        if (current !== step || state.screen !== "question") return;
        if (state.index === questions.length - 1) {
          state = { screen: "result", answers };
        } else {
          state = { screen: "question", index: state.index + 1, answers };
        }
        draw();
      }, 160);
    });
  });

  root!.querySelector("[data-again]")?.addEventListener("click", () => {
    state = { screen: "intro" };
    draw();
  });

  root!.querySelector("[data-anketa]")?.addEventListener("click", () => {
    openOutside(anketaUrl);
  });
}

function introHtml(): string {
  return `
    <section class="screen">
      <p class="brand"><span class="mark"></span> StartUp Academy</p>
      <h1>Хочешь в онлайн, но не понимаешь, с чего начать?</h1>
      <p class="lead">За 3 минуты покажу твой формат заработка, 5 услуг под тебя и план первых 7 дней.</p>
      <ul class="perks">
        <li>Твой формат старта</li>
        <li>5 услуг, за которые уже платят</li>
        <li>План первых 7 дней</li>
      </ul>
      <button class="cta" type="button" data-start>Погнали!</button>
    </section>
  `;
}

function questionHtml(index: number, answers: Answers): string {
  const question = questions[index];
  const picked = answers[question.id];
  const options = question.options
    .map((option) => {
      const on = option.id === picked ? " is-on" : "";
      return `<button class="option${on}" type="button" data-option="${esc(option.id)}">
        <span>${esc(option.label)}</span>
        <i></i>
      </button>`;
    })
    .join("");

  return `
    <section class="screen">
      <header class="top">
        <button class="back" type="button" data-back aria-label="Назад">←</button>
        <span>${index + 1} из ${questions.length}</span>
      </header>
      <div class="progress"><b style="width:${((index + 1) / questions.length) * 100}%"></b></div>
      <h1 class="ask">${esc(question.title)}</h1>
      <div class="options">${options}</div>
    </section>
  `;
}

function resultHtml(answers: Answers): string {
  const result = scoreQuiz(answers);
  const name = telegramFirstName();
  const hello = name ? `${esc(name)}, твой тип старта` : "Твой тип старта";
  const max = Math.max(result.ranked[0]?.points || 1, 1);
  const bars = result.ranked
    .map((item) => {
      const width = item.points === 0 ? 0 : Math.max(8, Math.round((item.points / max) * 100));
      return `<div class="bar">
        <b>${esc(item.name)}</b>
        <span><i style="width:${width}%"></i></span>
        <em>${item.points}</em>
      </div>`;
    })
    .join("");
  const second = result.secondary
    ? ` И немножко ${esc(result.secondary.name)}. ${esc(result.secondary.second)}`
    : "";
  const reasons = result.reasons.map((line) => `<p>${esc(line)}</p>`).join("");
  const services = result.primary.services.map((line) => `<li>${esc(line)}</li>`).join("");

  return `
    <section class="screen result">
      <p class="hello">${hello}</p>
      <h1 class="type">${esc(result.primary.name)}!</h1>
      <p class="line">${esc(result.primary.line)}</p>
      <p class="evidence">${esc(evidencePhrase(result.evidenceCount, questions.length))}${second}</p>
      <div class="bars">${bars}</div>
      <h2>Смотри, почему!</h2>
      ${reasons}
      <h2>5 услуг под тебя</h2>
      <ol class="services">${services}</ol>
      <h2>План первых 7 дней</h2>
      <p>${esc(result.primary.week)}</p>
      <button class="cta" type="button" data-anketa>${esc(result.primary.button)}</button>
      <button class="again" type="button" data-again>Пройти ещё раз</button>
    </section>
  `;
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
