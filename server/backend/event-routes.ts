///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";

// some useful database functions in here:
import { getAllEvents, createEvent } from "./database";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";

const router = express.Router();

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

function convertDateToString(date: number) {
  let today = new Date(date);
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const generatedDate = `${yyyy}/${mm}/${dd}`;
  return `${generatedDate}`;
}

router.get("/all-filtered", (req: Request, res: Response) => {
  const filters: Filter = req.query;
  let filtered: Event[] = getAllEvents();

  if (filters.search) {
    const reg: RegExp = new RegExp(filters.search, "i");
    filtered = filtered.filter((event) => {
      return Object.values(event).some((value) => reg.test(value.toString()));
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
  const getMore = () => {
    if (filters.offset) {
      if (filters.offset < filtered.length) {
        return true;
      }
    } else {
      return false;
    }
  };

  res.json({
    events: filtered.slice(0, filters.offset || filtered.length),
    more: getMore(),
  });
});

const convertDaysToMili = (days: number) => days * 24 * 60 * 60 * 1000;
interface FilteredBySession {
  date: string;
  count: number;
  session_id: string;
}

type FilteredByDate = Omit<FilteredBySession, "date"> & { date: string };

const toStartOfTheDay = (date: number): number => {
  return new Date(new Date(date).toDateString()).valueOf();
};

router.get("/by-days/:offset", (req: Request, res: Response) => {
  const offset: number = +req.params.offset;
  const events: Event[] = getAllEvents();
  let startingDate: number = new Date().valueOf() - convertDaysToMili(offset - 1);
  startingDate = toStartOfTheDay(startingDate);
  const endDate = startingDate - convertDaysToMili(7);
  let filtered = events.filter((event) => event.date < startingDate && event.date >= endDate);
  filtered.sort((firstEvent: Event, secondEvent: Event) => firstEvent.date - secondEvent.date);
  const filteredAndDateFixed: Omit<FilteredBySession, "count">[] = filtered.map((event) => {
    return { session_id: event.session_id, date: convertDateToString(event.date) };
  });
  let filteredAndGrouped: FilteredByDate[] = [];
  for (const eventToCheck of filteredAndDateFixed) {
    const indexChecker = filteredAndGrouped.findIndex(
      (event: FilteredByDate) => event.date === eventToCheck.date
    );
    if (indexChecker === -1) {
      filteredAndGrouped.push({ ...eventToCheck, count: 1 });
    } else {
      filteredAndGrouped[indexChecker].count++;
    }
  }
  let filteredAndGroupedBySessionId: FilteredBySession[] = [];
  for (const eventToCheck of filteredAndGrouped) {
    const indexChecker = filteredAndGroupedBySessionId.findIndex(
      (event: FilteredBySession) => event.session_id === eventToCheck.session_id
    );

    if (indexChecker === -1) {
      filteredAndGroupedBySessionId.push(eventToCheck);
    }
  }

  res.json(
    filteredAndGrouped.map((event: FilteredBySession) => {
      return { date: event.date, count: event.count };
    })
  );
});

router.get("/by-hours/:offset", (req: Request, res: Response) => {
  const offset: number = +req.params.offset;
  const events: Event[] = getAllEvents();
  let dateToCheck = new Date().valueOf() - convertDaysToMili(offset);
  let filteredEvents = events.filter(
    (event) => convertDateToString(event.date) === convertDateToString(dateToCheck)
  );
  filteredEvents = filteredEvents.map((event) => {
    return { ...event, date: new Date(event.date).getHours() };
  });
  let hoursArr = [];
  for (let i = 0; i < 24; i++) {
    if (i < 10) {
      hoursArr.push({ hour: `0${i}:00`, count: 0 });
    } else {
      hoursArr.push({ hour: `${i}:00`, count: 0 });
    }
  }
  let newArr: Event[] = [];
  for (const eventToCheck of filteredEvents) {
    const checker = newArr.findIndex(
      (event) => eventToCheck.session_id === event.session_id && eventToCheck.date === event.date
    );
    if (checker === -1) {
      hoursArr[eventToCheck.date].count++;
    } else {
      newArr.push(eventToCheck);
    }
  }
  res.json(hoursArr);
});

router.get("/today", (req: Request, res: Response) => {
  res.send("/today");
});

router.get("/week", (req: Request, res: Response) => {
  res.send("/week");
});

router.post("/", (req: Request, res: Response) => {
  const event: Event = req.body;
  try {
    createEvent(event);
    res.send("event added");
  } catch (err) {
    res.send("event not added");
  }
});

router.get("/retention", (req: Request, res: Response) => {
  const dayZero: number = +req.query.dayZero;
  const events: Event[] = getAllEvents();

  let startingDateInNumber: number = toStartOfTheDay(dayZero);
  const getStringDates = (startingDateInNumber: number): string[] => {
    return [
      convertDateToString(startingDateInNumber),
      convertDateToString(startingDateInNumber + convertDaysToMili(7)),
    ];
  };
  const getSingedUsers = (startingDateInNumber: number): string[] => {
    return events
      .filter(
        (event) =>
          startingDateInNumber + convertDaysToMili(7) > event.date &&
          event.date > startingDateInNumber &&
          event.name === "signup"
      )
      .map((user: Event): string => user.distinct_user_id);
  };
  const getOneWeekRetentions = (
    startDate: number,
    users: string[],
    weekNumber: number
  ): weeklyRetentionObject => {
    let weeklyRetentionObject: Omit<weeklyRetentionObject, "weeklyRetention"> = {
      registrationWeek: weekNumber,
      start: getStringDates(startDate)[0],
      end: getStringDates(startDate)[1],
      newUsers: getSingedUsers(startDate).length,
    };

    const weeklyRetention = [100];
    let currentDateCheck: number = startDate + convertDaysToMili(7);
    while (true) {
      if (currentDateCheck > toStartOfTheDay(new Date().valueOf()) + convertDaysToMili(1)) {
        break;
      }
      let countUserRetention = 0;
      const usersEvents: string[] = events
        .filter(
          (event) =>
            currentDateCheck + convertDaysToMili(7) > event.date &&
            event.date >= currentDateCheck &&
            event.name === "login"
        )
        .map((user: Event): string => user.distinct_user_id);
      const setUsersArr: string[] = Array.from(new Set(usersEvents));
      for (let user of setUsersArr) {
        if (users.findIndex((userToCheck) => userToCheck === user) !== -1) {
          countUserRetention++;
        }
      }

      weeklyRetention.push(Math.round((countUserRetention * 100) / users.length));

      currentDateCheck += convertDaysToMili(7);
    }
    return { ...weeklyRetentionObject, weeklyRetention };
  };
  const retentionsData = [];
  let retentionsCounter = 0;
  let numberStart = startingDateInNumber;

  while (numberStart < new Date().valueOf()) {
    if (getStringDates(numberStart)[0].slice(-5) === "10/25") {
      numberStart += 3600 * 1000;
    }
    retentionsCounter++;
    retentionsData.push(
      getOneWeekRetentions(numberStart, getSingedUsers(numberStart), retentionsCounter)
    );
    numberStart += convertDaysToMili(7);
    if (getStringDates(numberStart)[1].slice(-5) === "10/25") {
      numberStart += 3600 * 1000;
    }
  }

  res.json(retentionsData);
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
