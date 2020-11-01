///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";

// some useful database functions in here:
import { getAllEvents } from "./database";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";
import { ensureAuthenticated, validateMiddleware } from "./helpers";

import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isUserValidator,
} from "./validators";
const router = express.Router();

type eventName = "login" | "signup" | "admin" | "/";
type os = "windows" | "mac" | "linux" | "ios" | "android" | "other";
type browser = "chrome" | "safari" | "edge" | "firefox" | "ie" | "other";
type GeoLocation = {
  location: Location;
  accuracy: number;
};
type Location = {
  lat: number;
  lng: number;
};

interface Filter {
  sorting: string;
  type?: string;
  browser?: string;
  search?: string;
  offset?: number;
}

// Routes

router.get("/all", (req: Request, res: Response) => {
  const events: Event[] = getAllEvents();
  res.json(events);
});

router.get("/all-filtered", (req: Request, res: Response) => {
  const filters: Filter = req.query;
  let filtered: any[] = getAllEvents();

  if (filters.search) {
    const reg: RegExp = new RegExp(filters.search, "i");
    filtered = filtered.filter((event) => {
      let checker = false;
      for (const key in event) {
        if (reg.test(event[key])) {
          checker = true;
        }
      }
      return checker;
    });
  }

  if (filters.type) {
    filtered = filtered.filter((event: Event) => event.name === filters.type);
  }

  if (filters.browser) {
    filtered = filtered.filter((event: Event) => event.browser === filters.browser);
  }

  if (filters.sorting) {
    filtered.sort((firstEvent: Event, secondEvent: Event) =>
      filters.sorting === "+date"
        ? firstEvent.date - secondEvent.date
        : secondEvent.date - firstEvent.date
    );
  }

  res.json({
    events: filtered.slice(0, filters.offset || filtered.length),
  });
});

router.get("/by-days/:offset", (req: Request, res: Response) => {
  res.send("/by-days/:offset");
});

router.get("/by-hours/:offset", (req: Request, res: Response) => {
  res.send("/by-hours/:offset");
});

router.get("/today", (req: Request, res: Response) => {
  res.send("/today");
});

router.get("/week", (req: Request, res: Response) => {
  res.send("/week");
});

router.get("/retention", (req: Request, res: Response) => {
  const { dayZero } = req.query;
  res.send("/retention");
});
router.get("/:eventId", (req: Request, res: Response) => {
  res.send("/:eventId");
});

router.post("/", (req: Request, res: Response) => {
  res.send("/");
});

router.get("/chart/os/:time", (req: Request, res: Response) => {
  res.send("/chart/os/:time");
});

router.get("/chart/pageview/:time", (req: Request, res: Response) => {
  res.send("/chart/pageview/:time");
});

router.get("/chart/timeonurl/:time", (req: Request, res: Response) => {
  res.send("/chart/timeonurl/:time");
});

router.get("/chart/geolocation/:time", (req: Request, res: Response) => {
  res.send("/chart/geolocation/:time");
});

export default router;
