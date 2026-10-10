import { provideHttpClient } from "@angular/common/http";
import type { ApplicationConfig } from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};

export const API_URL = "http://localhost:4002";
