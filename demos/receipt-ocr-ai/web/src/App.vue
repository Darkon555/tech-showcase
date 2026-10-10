<script setup lang="ts">
import { ref } from "vue";
import { parseReceipt, type ParseResult } from "./api";
import { useReceiptStore } from "./store";

const store = useReceiptStore();
const file = ref<File | null>(null);
const result = ref<ParseResult | null>(null);
const loading = ref(false);
const error = ref("");

function onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
  error.value = "";
}

async function parse() {
  if (!file.value) return;
  loading.value = true;
  error.value = "";
  try {
    const res = await parseReceipt(file.value);
    result.value = res;
    store.add(res);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="wrap">
    <h1>🧾 Receipt Reader <span class="accent">OCR + AI</span></h1>
    <p class="muted">Vue 3 + Flask + Tesseract OCR + Ollama (local LLM)</p>

    <section class="card">
      <input type="file" accept="image/*" @change="onFile" />
      <button :disabled="!file || loading" @click="parse">
        {{ loading ? "Parsing…" : "Parse receipt" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <div v-if="result" class="grid">
      <section class="card">
        <h2>Structured</h2>
        <ul class="fields">
          <li><span>Merchant</span><b>{{ result.structured.merchant ?? "—" }}</b></li>
          <li><span>Date</span><b>{{ result.structured.date ?? "—" }}</b></li>
          <li><span>Currency</span><b>{{ result.structured.currency ?? "—" }}</b></li>
          <li><span>Total</span><b>{{ result.structured.total ?? "—" }}</b></li>
        </ul>
        <h3>Items</h3>
        <ul class="items">
          <li v-for="(it, i) in result.structured.items" :key="i">
            {{ it.description }} <span class="muted">{{ it.amount ?? "" }}</span>
          </li>
        </ul>
      </section>

      <section class="card">
        <h2>Raw OCR text</h2>
        <pre>{{ result.rawText }}</pre>
      </section>
    </div>

    <section v-if="store.history.length" class="card">
      <h2>This session ({{ store.history.length }})</h2>
      <ul class="items">
        <li v-for="(r, i) in store.history" :key="i">
          {{ r.structured.merchant ?? "Unknown" }} —
          {{ r.structured.total ?? "?" }} {{ r.structured.currency ?? "" }}
        </li>
      </ul>
    </section>
  </main>
</template>
