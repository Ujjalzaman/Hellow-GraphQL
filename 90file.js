/* =========================
  1) Throttle
========================= */
function throttle(fn, wait) {
  let last = 0;
  let timer = null;
  let lastArgs, lastThis;

  return function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (timer) clearTimeout(timer), (timer = null);
      last = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        last = Date.now();
        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  };
}

/* =========================
  2) Memoize (sync)
========================= */
function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function (...args) {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key);
    const val = fn.apply(this, args);
    cache.set(key, val);
    return val;
  };
}

/* =========================
  3) Promisify (Node-style cb(err, data))
========================= */
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  };
}

/* =========================
  4) EventEmitter (on/off/emit)
========================= */
class EventEmitter {
  constructor() {
    this._events = new Map(); // event -> Set(handlers)
  }
  on(event, handler) {
    if (!this._events.has(event)) this._events.set(event, new Set());
    this._events.get(event).add(handler);
    return () => this.off(event, handler); // unsubscribe helper
  }
  off(event, handler) {
    const set = this._events.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this._events.delete(event);
  }
  emit(event, ...args) {
    const set = this._events.get(event);
    if (!set) return false;
    for (const handler of [...set]) handler(...args);
    return true;
  }
}

/* =========================
  5) Number -> Roman
========================= */
function toRoman(num) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let res = "";
  for (const [val, sym] of map) {
    while (num >= val) {
      res += sym;
      num -= val;
    }
  }
  return res;
}

/* =========================
  6) Roman -> Number
========================= */
function fromRoman(s) {
  const val = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  let sum = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = val[s[i]];
    const next = val[s[i + 1]] || 0;
    if (cur < next) sum -= cur;
    else sum += cur;
  }
  return sum;
}

/* =========================
  7) Valid parentheses ()[]{} 
========================= */
function isValidBrackets(s) {
  const stack = [];
  const match = { ")":"(", "]":"[", "}":"{" };
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else {
      if (stack.pop() !== match[ch]) return false;
    }
  }
  return stack.length === 0;
}

/* =========================
  8) Deep clone (objects/arrays, Date/RegExp/Map/Set)
========================= */
function deepClone(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (seen.has(obj)) return seen.get(obj);

  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (obj instanceof Map) {
    const m = new Map();
    seen.set(obj, m);
    for (const [k, v] of obj) m.set(deepClone(k, seen), deepClone(v, seen));
    return m;
  }
  if (obj instanceof Set) {
    const s = new Set();
    seen.set(obj, s);
    for (const v of obj) s.add(deepClone(v, seen));
    return s;
  }

  const out = Array.isArray(obj) ? [] : {};
  seen.set(obj, out);
  for (const key of Reflect.ownKeys(obj)) {
    out[key] = deepClone(obj[key], seen);
  }
  return out;
}

/* =========================
  9) Deep equality
========================= */
function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;
  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  // cycle handling
  const seenA = seen.get(a);
  if (seenA && seenA === b) return true;
  seen.set(a, b);

  if (a.constructor !== b.constructor) return false;

  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;

  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;
    }
    return true;
  }

  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!keysB.includes(k)) return false;
    if (!deepEqual(a[k], b[k], seen)) return false;
  }
  return true;
}

/* =========================
  10) All pairs that sum to target (unique pairs of values)
========================= */
function pairsSum(nums, target) {
  const seen = new Set();
  const used = new Set(); // to make unique pair keys
  const res = [];
  for (const x of nums) {
    const y = target - x;
    if (seen.has(y)) {
      const a = Math.min(x, y), b = Math.max(x, y);
      const key = `${a},${b}`;
      if (!used.has(key)) {
        used.add(key);
        res.push([a, b]);
      }
    }
    seen.add(x);
  }
  return res;
}

/* =========================
  11) k-th largest in unsorted array (Quickselect)
========================= */
function kthLargest(nums, k) {
  const arr = nums.slice();
  const target = arr.length - k;

  function partition(l, r, pivotIndex) {
    const pivot = arr[pivotIndex];
    [arr[pivotIndex], arr[r]] = [arr[r], arr[pivotIndex]];
    let store = l;
    for (let i = l; i < r; i++) {
      if (arr[i] < pivot) {
        [arr[i], arr[store]] = [arr[store], arr[i]];
        store++;
      }
    }
    [arr[store], arr[r]] = [arr[r], arr[store]];
    return store;
  }

  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const pivotIndex = l + Math.floor(Math.random() * (r - l + 1));
    const idx = partition(l, r, pivotIndex);
    if (idx === target) return arr[idx];
    if (idx < target) l = idx + 1;
    else r = idx - 1;
  }
}

/* =========================
  12) Rotate array right by k (in-place)
========================= */
function rotateArray(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  k %= n;

  const reverse = (i, j) => {
    while (i < j) [nums[i], nums[j]] = [nums[j], nums[i]], i++, j--;
  };

  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
  return nums;
}

/* =========================
  13) Majority element (> n/2) if exists
========================= */
function majorityElement(nums) {
  let cand = null, count = 0;
  for (const x of nums) {
    if (count === 0) cand = x;
    count += (x === cand) ? 1 : -1;
  }
  // verify
  let freq = 0;
  for (const x of nums) if (x === cand) freq++;
  return freq > Math.floor(nums.length / 2) ? cand : null;
}

/* =========================
  14) Missing number from 1..n (array length n-1)
========================= */
function missingNumber1toN(arr, n) {
  const expected = (n * (n + 1)) / 2;
  const actual = arr.reduce((s, x) => s + x, 0);
  return expected - actual;
}

/* =========================
  15) Transpose matrix (new)
========================= */
function transpose(matrix) {
  const m = matrix.length, n = matrix[0]?.length || 0;
  const out = Array.from({ length: n }, () => Array(m));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      out[j][i] = matrix[i][j];
  return out;
}

/* =========================
  16) Rotate NxN matrix 90° clockwise (in-place)
========================= */
function rotateMatrix90(mat) {
  const n = mat.length;
  // transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [mat[i][j], mat[j][i]] = [mat[j][i], mat[i][j]];
    }
  }
  // reverse each row
  for (let i = 0; i < n; i++) mat[i].reverse();
  return mat;
}

/* =========================
  17) Longest common prefix
========================= */
function longestCommonPrefix(strs) {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

/* =========================
  18) Palindrome (alnum only, ignore case)
========================= */
function isPalindrome(s) {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let i = 0, j = t.length - 1;
  while (i < j) {
    if (t[i] !== t[j]) return false;
    i++; j--;
  }
  return true;
}

/* =========================
  19) Word count
========================= */
function wordCount(text) {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
  const out = {};
  for (const w of words) out[w] = (out[w] || 0) + 1;
  return out;
}

/* =========================
  20) Permutations of array
========================= */
function permutations(arr) {
  const res = [];
  const used = Array(arr.length).fill(false);
  const path = [];

  function backtrack() {
    if (path.length === arr.length) {
      res.push(path.slice());
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(arr[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }
  backtrack();
  return res;
}

/* =========================
  21) Subsets (power set)
========================= */
function subsets(arr) {
  const res = [[]];
  for (const x of arr) {
    const size = res.length;
    for (let i = 0; i < size; i++) res.push([...res[i], x]);
  }
  return res;
}

/* =========================
  22) Binary search (sorted array)
========================= */
function binarySearch(arr, target) {
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const m = l + ((r - l) >> 1);
    if (arr[m] === target) return m;
    if (arr[m] < target) l = m + 1;
    else r = m - 1;
  }
  return -1;
}

/* =========================
  23) Merge two sorted arrays (no sort())
========================= */
function mergeSorted(a, b) {
  const res = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) res.push(a[i++]);
    else res.push(b[j++]);
  }
  while (i < a.length) res.push(a[i++]);
  while (j < b.length) res.push(b[j++]);
  return res;
}

/* =========================
  24) Intersection (unique)
========================= */
function intersection(a, b) {
  const sb = new Set(b);
  const res = new Set();
  for (const x of a) if (sb.has(x)) res.add(x);
  return [...res];
}

/* =========================
  25) Difference A \ B (unique)
========================= */
function difference(a, b) {
  const sb = new Set(b);
  const res = new Set();
  for (const x of a) if (!sb.has(x)) res.add(x);
  return [...res];
}

/* =========================
  26) Fisher–Yates shuffle (uniform)
========================= */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* =========================
  27) Longest word in sentence
========================= */
function longestWord(sentence) {
  const words = sentence.match(/[A-Za-z0-9']+/g) || [];
  let best = "";
  for (const w of words) if (w.length > best.length) best = w;
  return best;
}

/* =========================
  28) Reverse word order (keep each word chars)
========================= */
function reverseWordsOrder(s) {
  return s.trim().split(/\s+/).reverse().join(" ");
}

/* =========================
  29) Reverse characters of each word (keep word order)
========================= */
function reverseEachWord(s) {
  return s.split(/\s+/).map(w => [...w].reverse().join("")).join(" ");
}

/* =========================
  30) snake_case -> camelCase
========================= */
function snakeToCamel(s) {
  return s.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/* =========================
  31) camelCase -> snake_case
========================= */
function camelToSnake(s) {
  return s.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/* =========================
  32) String rotation check
========================= */
function isRotation(a, b) {
  return a.length === b.length && (a + a).includes(b);
}

/* =========================
  33) First missing positive (O(n))
========================= */
function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (
      nums[i] > 0 &&
      nums[i] <= n &&
      nums[nums[i] - 1] !== nums[i]
    ) {
      const j = nums[i] - 1;
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
  return n + 1;
}

/* =========================
  34) once(fn)
========================= */
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (called) return result;
    called = true;
    result = fn.apply(this, args);
    return result;
  };
}

/* =========================
  35) Flatten nested object with dot keys
========================= */
function flattenDot(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flattenDot(v, key, out);
    } else {
      out[key] = v;
    }
  }
  return out;
}

/* =========================
  36) Unflatten dot keys -> nested object
========================= */
function unflattenDot(obj) {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const parts = k.split(".");
    let cur = res;
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] ??= {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = v;
  }
  return res;
}

/* =========================
  37) Merge overlapping intervals
========================= */
function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0].slice()];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    const last = res[res.length - 1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else res.push([s, e]);
  }
  return res;
}

/* =========================
  38) Insert + merge interval
========================= */
function insertInterval(intervals, newInt) {
  const res = [];
  let [ns, ne] = newInt;
  let i = 0;

  while (i < intervals.length && intervals[i][1] < ns) res.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= ne) {
    ns = Math.min(ns, intervals[i][0]);
    ne = Math.max(ne, intervals[i][1]);
    i++;
  }
  res.push([ns, ne]);
  while (i < intervals.length) res.push(intervals[i++]);
  return res;
}

/* =========================
  39) Fibonacci (memoized)
========================= */
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] != null) return memo[n];
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

/* =========================
  40) Fibonacci (iterative)
========================= */
function fibIter(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

/* =========================
  41) Power of two
========================= */
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/* =========================
  42) Sum of all numbers in nested array
========================= */
function sumNestedArray(arr) {
  let sum = 0;
  for (const x of arr) {
    if (Array.isArray(x)) sum += sumNestedArray(x);
    else sum += x;
  }
  return sum;
}

/* =========================
  43) LRU Cache (Map keeps insertion order)
========================= */
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  set(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.cap) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}

/* =========================
  44) bind implementation (simple)
========================= */
function myBind(fn, thisArg, ...presetArgs) {
  return function (...laterArgs) {
    return fn.apply(thisArg, [...presetArgs, ...laterArgs]);
  };
}

/* =========================
  45) Limit concurrent async tasks (tasks = [() => Promise])
========================= */
async function limitConcurrency(tasks, limit) {
  const results = Array(tasks.length);
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const cur = next++;
      results[cur] = await tasks[cur]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

/* =========================
  46) Retry promise function N times with delay
========================= */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function retry(fn, retries, delayMs = 0) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries && delayMs) await sleep(delayMs);
    }
  }
  throw lastErr;
}

/* =========================
  47) Fetch URLs in parallel, keep order
========================= */
async function fetchAllInOrder(urls) {
  const promises = urls.map(url => fetch(url).then(r => r.text()));
  return Promise.all(promises);
}

/* =========================
  48) sleep(ms) already above
========================= */

/* =========================
  49) Flat list (id,parentId) -> tree
========================= */
function listToTree(items, rootParentId = null) {
  const map = new Map(items.map(x => [x.id, { ...x, children: [] }]));
  const roots = [];
  for (const item of map.values()) {
    if (item.parentId === rootParentId || item.parentId == null) roots.push(item);
    else map.get(item.parentId)?.children.push(item);
  }
  return roots;
}

/* =========================
  50) Tree -> flat list with depth
========================= */
function treeToFlat(nodes, depth = 0, out = []) {
  for (const n of nodes) {
    const { children, ...rest } = n;
    out.push({ ...rest, depth });
    if (children?.length) treeToFlat(children, depth + 1, out);
  }
  return out;
}

/* =========================
  51) Closest ancestor with class (DOM)
========================= */
function closestWithClass(el, className) {
  if (!el) return null;
  if (el.closest) return el.closest("." + className);
  while (el) {
    if (el.classList && el.classList.contains(className)) return el;
    el = el.parentElement;
  }
  return null;
}

/* =========================
  52) Delegate click event
========================= */
function delegateClick(parentEl, selector, handler) {
  parentEl.addEventListener("click", (e) => {
    const target = e.target.closest(selector);
    if (target && parentEl.contains(target)) handler(e, target);
  });
}

/* =========================
  53) Count total elements in DOM subtree
========================= */
function countElements(root) {
  if (!root || !root.children) return 0;
  let count = 1; // include root
  for (const child of root.children) count += countElements(child);
  return count;
}

/* =========================
  54) Load image -> Promise
========================= */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/* =========================
  55) Parse query string -> object
========================= */
function parseQuery(qs) {
  const params = new URLSearchParams(qs.startsWith("?") ? qs : "?" + qs);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

/* =========================
  56) Object -> query string
========================= */
function toQuery(obj) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) params.set(k, String(v));
  const s = params.toString();
  return s ? "?" + s : "";
}

/* =========================
  57) Format Date as YYYY-MM-DD HH:mm:ss
========================= */
function formatDate(dt) {
  const pad = (n) => String(n).padStart(2, "0");
  const Y = dt.getFullYear();
  const M = pad(dt.getMonth() + 1);
  const D = pad(dt.getDate());
  const h = pad(dt.getHours());
  const m = pad(dt.getMinutes());
  const s = pad(dt.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

/* =========================
  58) All dates between (inclusive)
========================= */
function datesBetween(startDate, endDate) {
  const res = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
  cur.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  while (cur <= end) {
    res.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return res;
}

/* =========================
  59) Validate email regex
========================= */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================
  60) Strong password (len>=8, upper, lower, digit, special)
========================= */
function isStrongPassword(pw) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
}

/* =========================
  61) Most frequent element (value + count)
========================= */
function mostFrequent(arr) {
  const m = new Map();
  let bestVal, bestCount = 0;
  for (const x of arr) {
    const c = (m.get(x) || 0) + 1;
    m.set(x, c);
    if (c > bestCount) bestCount = c, bestVal = x;
  }
  return { value: bestVal, count: bestCount };
}

/* =========================
  62) Total duration HH:MM (tasks: [{durationMinutes}] or duration in minutes)
========================= */
function totalDurationHHMM(tasks) {
  const totalMin = tasks.reduce((sum, t) => sum + (t.durationMinutes ?? t.duration ?? 0), 0);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* =========================
  63) Valid JSON string?
========================= */
function isValidJSON(str) {
  try { JSON.parse(str); return true; } catch { return false; }
}

/* =========================
  64) Async memoization (cache Promises)
========================= */
function asyncMemoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return async function (...args) {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key);
    const p = Promise.resolve().then(() => fn.apply(this, args));
    cache.set(key, p);
    try {
      return await p;
    } catch (e) {
      cache.delete(key); // don’t cache failures
      throw e;
    }
  };
}

/* =========================
  65) Binary search in rotated sorted array
========================= */
function searchRotated(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const m = l + ((r - l) >> 1);
    if (nums[m] === target) return m;

    if (nums[l] <= nums[m]) { // left sorted
      if (nums[l] <= target && target < nums[m]) r = m - 1;
      else l = m + 1;
    } else { // right sorted
      if (nums[m] < target && target <= nums[r]) l = m + 1;
      else r = m - 1;
    }
  }
  return -1;
}

/* =========================
  66) All indices of a value
========================= */
function allIndices(arr, value) {
  const res = [];
  for (let i = 0; i < arr.length; i++) if (arr[i] === value) res.push(i);
  return res;
}

/* =========================
  67) Can attend all meetings (no overlaps)
========================= */
function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) return false;
  }
  return true;
}

/* =========================
  68) Stopwatch
========================= */
class Stopwatch {
  constructor() {
    this.running = false;
    this.startTime = 0;
    this.elapsed = 0;
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now();
  }
  stop() {
    if (!this.running) return;
    this.elapsed += Date.now() - this.startTime;
    this.running = false;
  }
  reset() {
    this.running = false;
    this.startTime = 0;
    this.elapsed = 0;
  }
  getTimeMs() {
    return this.running ? this.elapsed + (Date.now() - this.startTime) : this.elapsed;
  }
}

/* =========================
  69) Seconds -> HH:MM:SS
========================= */
function secondsToHHMMSS(sec) {
  sec = Math.max(0, Math.floor(sec));
  const hh = Math.floor(sec / 3600);
  const mm = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}

/* =========================
  70) Sort objects by multiple keys with directions
========================= */
function sortByKeys(arr, specs) {
  // specs: [{key:'age', dir:'asc'|'desc'}, ...]
  const dirVal = (d) => (d === "desc" ? -1 : 1);
  return arr.slice().sort((a, b) => {
    for (const { key, dir = "asc" } of specs) {
      const da = a[key], db = b[key];
      if (da < db) return -1 * dirVal(dir);
      if (da > db) return  1 * dirVal(dir);
    }
    return 0;
  });
}

/* =========================
  71) Two arrays equal (same order)
========================= */
function arraysEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
  return true;
}

/* =========================
  72) Longest Increasing Subsequence length (O(n log n))
========================= */
function lisLength(nums) {
  const tails = [];
  for (const x of nums) {
    let l = 0, r = tails.length;
    while (l < r) {
      const m = (l + r) >> 1;
      if (tails[m] < x) l = m + 1;
      else r = m;
    }
    tails[l] = x;
  }
  return tails.length;
}

/* =========================
  73) Count vowels and consonants
========================= */
function countVowelsConsonants(s) {
  const letters = s.toLowerCase().match(/[a-z]/g) || [];
  const vowelsSet = new Set(["a","e","i","o","u"]);
  let vowels = 0, consonants = 0;
  for (const ch of letters) vowelsSet.has(ch) ? vowels++ : consonants++;
  return { vowels, consonants };
}

/* =========================
  74) Separate letters and digits
========================= */
function separateLettersDigits(s) {
  const letters = [];
  const digits = [];
  for (const ch of s) {
    if (/[0-9]/.test(ch)) digits.push(ch);
    else if (/[a-zA-Z]/.test(ch)) letters.push(ch);
  }
  return { letters, digits };
}

/* =========================
  75) Promise pool: run at most N in parallel (factories)
========================= */
async function promisePool(factories, n) {
  const results = Array(factories.length);
  let i = 0;

  async function worker() {
    while (i < factories.length) {
      const idx = i++;
      results[idx] = await factories[idx]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(n, factories.length) }, worker));
  return results;
}

/* =========================
  76) Deep freeze object
========================= */
function deepFreeze(obj) {
  if (!obj || typeof obj !== "object") return obj;
  Object.freeze(obj);
  for (const key of Reflect.ownKeys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object" && !Object.isFrozen(val)) deepFreeze(val);
  }
  return obj;
}

/* =========================
  77) Random integer [min,max] without bias (crypto-based)
========================= */
function randomIntUnbiased(min, max) {
  min = Math.ceil(min); max = Math.floor(max);
  if (max < min) throw new Error("max must be >= min");
  const range = max - min + 1;

  // Use Web Crypto if available
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    // fallback (can be slightly biased)
    return min + Math.floor(Math.random() * range);
  }

  const maxUint32 = 0xFFFFFFFF;
  const limit = Math.floor((maxUint32 + 1) / range) * range; // rejection threshold
  const buf = new Uint32Array(1);
  while (true) {
    cryptoObj.getRandomValues(buf);
    const x = buf[0];
    if (x < limit) return min + (x % range);
  }
}

/* =========================
  78) Remove duplicates by key (keep first)
========================= */
function uniqueByKey(arr, key) {
  const seen = new Set();
  const res = [];
  for (const obj of arr) {
    const k = obj[key];
    if (!seen.has(k)) {
      seen.add(k);
      res.push(obj);
    }
  }
  return res;
}

/* =========================
  79) Mutual friends between two users
========================= */
function mutualFriends(usersById, userAId, userBId) {
  const a = usersById[userAId]?.friends || [];
  const b = usersById[userBId]?.friends || [];
  const sb = new Set(b);
  return a.filter(id => sb.has(id));
}

/* =========================
  80) Flatten object -> bracket notation (user[address][city])
========================= */
function flattenBracket(obj, prefix = "", out = {}) {
  const isObj = (v) => v && typeof v === "object";
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (isObj(v) && !Array.isArray(v)) flattenBracket(v, key, out);
    else out[key] = v;
  }
  return out;
}

/* =========================
  81) Topological sort (tasks with dependencies)
  input: edges [ [from,to] ] meaning from -> to
========================= */
function topoSort(nodes, edges) {
  const adj = new Map(nodes.map(n => [n, []]));
  const indeg = new Map(nodes.map(n => [n, 0]));
  for (const [u, v] of edges) {
    adj.get(u).push(v);
    indeg.set(v, (indeg.get(v) || 0) + 1);
  }
  const q = [];
  for (const [n, d] of indeg) if (d === 0) q.push(n);

  const res = [];
  while (q.length) {
    const u = q.shift();
    res.push(u);
    for (const v of adj.get(u) || []) {
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) q.push(v);
    }
  }
  return res.length === nodes.length ? res : null; // null => cycle
}

/* =========================
  82) Detect directed cycle (adj list)
========================= */
function hasDirectedCycle(adj) {
  const state = new Map(); // 0=unvisited,1=visiting,2=done

  function dfs(u) {
    state.set(u, 1);
    for (const v of adj[u] || []) {
      const st = state.get(v) || 0;
      if (st === 1) return true;
      if (st === 0 && dfs(v)) return true;
    }
    state.set(u, 2);
    return false;
  }

  for (const u of Object.keys(adj)) {
    if ((state.get(u) || 0) === 0 && dfs(u)) return true;
  }
  return false;
}

/* =========================
  83) Minimum window substring
========================= */
function minWindow(s, t) {
  if (!t) return "";
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);

  let have = 0;
  const needCount = t.length;
  const window = new Map();
  let best = [0, Infinity];
  let l = 0;

  for (let r = 0; r < s.length; r++) {
    const ch = s[r];
    window.set(ch, (window.get(ch) || 0) + 1);
    if (need.has(ch) && window.get(ch) <= need.get(ch)) have++;

    while (have === needCount) {
      if (r - l < best[1] - best[0]) best = [l, r + 1];
      const leftCh = s[l++];
      window.set(leftCh, window.get(leftCh) - 1);
      if (need.has(leftCh) && window.get(leftCh) < need.get(leftCh)) have--;
    }
  }

  return best[1] === Infinity ? "" : s.slice(best[0], best[1]);
}

/* =========================
  84) Coin change (min coins)
========================= */
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) {
      dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

/* =========================
  85) Max profit (single buy/sell)
========================= */
function maxProfit(prices) {
  let minP = Infinity, best = 0;
  for (const p of prices) {
    best = Math.max(best, p - minP);
    minP = Math.min(minP, p);
  }
  return best;
}

/* =========================
  86) Longest consecutive sequence
========================= */
function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (!set.has(x - 1)) {
      let cur = x, len = 1;
      while (set.has(cur + 1)) cur++, len++;
      best = Math.max(best, len);
    }
  }
  return best;
}

/* =========================
  87) Compress string "aaabb" -> "a3b2"
========================= */
function compressString(s) {
  if (!s) return "";
  let res = "";
  let count = 1;
  for (let i = 1; i <= s.length; i++) {
    if (s[i] === s[i - 1]) count++;
    else {
      res += s[i - 1] + String(count);
      count = 1;
    }
  }
  return res;
}

/* =========================
  88) Expand "a3b2" -> "aaabb"
========================= */
function expandCompressed(s) {
  let res = "";
  for (let i = 0; i < s.length; ) {
    const ch = s[i++];
    let num = "";
    while (i < s.length && /[0-9]/.test(s[i])) num += s[i++];
    res += ch.repeat(Number(num || "1"));
  }
  return res;
}

/* =========================
  89) Pipeline utility
========================= */
class Pipeline {
  constructor() { this.fns = []; }
  use(fn) { this.fns.push(fn); return this; }
  run(value) { return this.fns.reduce((v, fn) => fn(v), value); }
}

/* =========================
  90) Largest connected group of 1s in grid (BFS/DFS)
========================= */
function largestIsland(grid) {
  const m = grid.length, n = grid[0]?.length || 0;
  const seen = Array.from({ length: m }, () => Array(n).fill(false));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let best = 0;

  function dfs(r, c) {
    seen[r][c] = true;
    let size = 1;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr>=0 && nr<m && nc>=0 && nc<n && !seen[nr][nc] && grid[nr][nc] === 1) {
        size += dfs(nr, nc);
      }
    }
    return size;
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (!seen[i][j] && grid[i][j] === 1) {
        best = Math.max(best, dfs(i, j));
      }
    }
  }
  return best;
}
