import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
  // Define your routes here
  app.get("/api", (req, res) => {
    res.send("Hello World");
  });

  // Create and return the server
  return createServer(app);
}
