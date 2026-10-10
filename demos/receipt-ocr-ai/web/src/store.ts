import { defineStore } from "pinia";
import { ref } from "vue";
import type { ParseResult } from "./api";

/** Session-only list of parsed receipts (spec US-4). */
export const useReceiptStore = defineStore("receipts", () => {
  const history = ref<ParseResult[]>([]);

  function add(result: ParseResult) {
    history.value.unshift(result);
  }

  return { history, add };
});
