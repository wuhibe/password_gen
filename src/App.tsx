import { createSignal } from 'solid-js';

const [pass, setPass] = createSignal('');
const [count, setCount] = createSignal(5);
const [up, setUp] = createSignal(false);
const [low, setLow] = createSignal(false);
const [num, setNum] = createSignal(false);
const [sym, setSym] = createSignal(false);
const [strength, setStrength] = createSignal('');

const lower = 'abcdefghijklmnopqrstuvwxyz';
const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '1234567890';
const symbols = ',.!@#$%^&*';

// @ts-ignore
const db = new PouchDB('passwords');

const handleClick = (e) => {
  const passwrd = document.querySelector('#password');
  navigator.clipboard.writeText(passwrd.value);
};

const passwordChanged = () => {
  const strongRegex = /^(?=.{14,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/g;
  const mediumRegex = /^(?=.{10,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$/g;
  const enoughRegex = /(?=.{8,}).*/g;
  const pwd = document.getElementById('password');
  if (pwd.value.length === 0 || enoughRegex.test(pwd.value) === false) {
    setStrength('');
  } else if (strongRegex.test(pwd.value)) {
    setStrength('STRONG');
  } else if (mediumRegex.test(pwd.value)) {
    setStrength('MEDIUM');
  } else {
    setStrength('WEAK');
  }
};

const genPass = () => {
  const letter =
    (up() ? upper : '') +
    (low() ? lower : '') +
    (num() ? numbers : '') +
    (sym() ? symbols : '');
  let randomString = '';
  for (let i = 0; i < count(); i += 1) {
    const randomStringNumber = Math.floor(
      1 + Math.random() * (letter.length - 1),
    );
    randomString += letter.substring(
      randomStringNumber,
      randomStringNumber + 1,
    );
  }
  return randomString;
};

const updateParams = (e) => {
  if (e.currentTarget.id === 'count') {
    setCount(e.currentTarget.value);
  } else if (e.currentTarget.id === 'uppercase') {
    setUp(!up());
  } else if (e.currentTarget.id === 'lowercase') {
    setLow(!low());
  } else if (e.currentTarget.id === 'numbers') {
    setNum(!num());
  } else if (e.currentTarget.id === 'symbols') {
    setSym(!sym());
  }
};

const savePass = async (pass) => {
  const passes = await db.allDocs();
  const len = await passes.rows.length;
  await db.put({ pass, _id: String(len + 1), strength: strength() });
};
const dumpAll = async () => {
  const all = (await db.allDocs()).rows;
  all.forEach(async (pas) => {
    const p = await db.get(pas.id);
    console.log(`${p.pass} => ${p.strength}`);
  });
};

const generatePass = async () => {
  const pass = genPass();
  setPass(pass);
  passwordChanged();
  if (pass.length > 0) {
    await savePass(pass);
  }
};

const App = () => {
  return (
    <div class="font-mono main">
      <div class="transparent">
        <h1 style="text-align:center; padding:20px">Password Generator</h1>
      </div>
      <div class="center bg-neutral form-control">
        <label class="password input-group">
          <input
            id="password"
            type="text"
            disabled
            placeholder="P4$5W0rD!"
            value={pass()}
            class="input input-sm disabled:placeholder-gray-400"
          />
          <button
            class="btn transparent btn-sm"
            onClick={(e) => handleClick(e)}
          >
            <i class="green fa fa-files-o" />
          </button>
        </label>
      </div>
      <div class="bg-neutral form-control">
        <p style="padding:8px">Character Length</p>
        <label class="input-group">
          <input
            id="count"
            class="rounded-none range range-sm range-accent"
            type="range"
            value={count()}
            step="1"
            min="0"
            max="100"
            onInput={(e) => updateParams(e)}
          />
          <span class="badge green transparent">{count()}</span>
        </label>
        <hr />
        <label class="label cursor-pointer checkboxes">
          <input
            type="checkbox"
            class="rounded-none checkbox checkbox-accent input-bordered"
            id="uppercase"
            onInput={(e) => updateParams(e)}
          />
          <span>Include Uppercase Letters</span>
        </label>

        <label class="label cursor-pointer checkboxes">
          <input
            type="checkbox"
            class="rounded-none checkbox checkbox-accent input-bordered"
            id="lowercase"
            onInput={(e) => updateParams(e)}
          />
          <span>Include Lowercase Letters</span>
        </label>

        <label class="label cursor-pointer checkboxes">
          <input
            type="checkbox"
            class="rounded-none checkbox checkbox-accent input-bordered"
            id="numbers"
            onInput={(e) => updateParams(e)}
          />
          <span>Include Numbers</span>
        </label>

        <label class="label cursor-pointer checkboxes">
          <input
            type="checkbox"
            class="rounded-none checkbox checkbox-accent input-bordered"
            id="symbols"
            onInput={(e) => updateParams(e)}
          />
          <span>Include Symbols</span>
        </label>
        <hr />
        <label class="label input-group darker">
          <p>Strength</p>
          <span class="bars transparent">
            <div id="strength">{strength()}</div>
            <div
              class={`box box-1 ${
                strength() === ''
                  ? ''
                  : strength() === 'WEAK'
                    ? 'weak'
                    : strength() === 'MEDIUM'
                      ? 'medium'
                      : 'strong'
              }`}
            />
            <div
              class={`box box-1 ${
                strength() === '' || strength() === 'WEAK'
                  ? ''
                  : strength() === 'MEDIUM'
                    ? 'medium'
                    : 'strong'
              }`}
            />
            <div
              class={`box box-1' ${
                strength() === '' || strength() === 'WEAK'
                  ? ''
                  : strength() === 'MEDIUM'
                    ? 'medium'
                    : 'strong'
              }`}
            />
            <div
              class={`box box-1 ${
                strength() === '' ||
                strength() === 'WEAK' ||
                strength() === 'MEDIUM'
                  ? ''
                  : 'strong'
              }`}
            />
            <div />
          </span>
        </label>
        <hr />
        <button
          class="accent form-control center"
          onClick={async () => await generatePass()}
        >
          <span>
            Generate <i class="fa fa-arrow-right" />
          </span>
        </button>
      </div>
      <button
        class="accent form-control center bottom"
        onclick={async () => await dumpAll()}
      >
        All Passes (In Console)
      </button>
    </div>
  );
};

export default App;
