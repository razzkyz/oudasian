/**
 * icons.js — Lucide SVG icons for vanilla JS (no React, no DOM needed)
 * Lucide exports icon data as arrays: [['tagName', {attrs}, children?], ...]
 * We render them to SVG strings directly.
 */

// --- Import the icons we need from lucide ---
import {
  MapPin, Globe, Star, Shield, Compass, Hotel,
  Bus, Plane, Users, Clock, Camera, Mountain,
  Waves, TreePine, Sun, Heart,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Phone, Mail, MessageCircle,
  Search, Menu, X, LogOut, Settings,
  LayoutDashboard, Package, Image as LucideImage,
  Save, Download, Trash2, Edit3, Plus, Check,
  AlertCircle, Info, CheckCircle2,
  Ticket, Map, CalendarDays, BadgeCheck,
  Sparkles, ArrowRight, ArrowLeft,
  Palmtree, Anchor, Binoculars, Building2,
  Navigation, Award, Lock, Palette, FileText,
  Crown, Gem
} from 'lucide'

// Render lucide icon data array → SVG string
const toSvg = (iconData, size = 18, cls = '') => {
  const renderEl = ([tag, attrs, ...children]) => {
    const attrStr = Object.entries(attrs || {})
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')
    const inner = (children || []).flat().filter(Boolean).map(c =>
      Array.isArray(c) ? renderEl(c) : ''
    ).join('')
    return `<${tag} ${attrStr}>${inner}</${tag}>`
  }

  const paths = (iconData || []).map(renderEl).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide ${cls}" aria-hidden="true">${paths}</svg>`
}

// --- Icon function shorthand ---
export const Icon = (iconData, size = 18, cls = '') => toSvg(iconData, size, cls)

// --- Named icon shorthands for common use ---
export const I = {
  // Navigation & branding
  Plane:        (s=18) => toSvg(Plane, s),
  Globe:        (s=18) => toSvg(Globe, s),
  Menu:         (s=20) => toSvg(Menu, s),
  Close:        (s=20) => toSvg(X, s),
  ArrowRight:   (s=16) => toSvg(ArrowRight, s),
  ArrowLeft:    (s=16) => toSvg(ArrowLeft, s),
  ChevronRight: (s=16) => toSvg(ChevronRight, s),
  ChevronLeft:  (s=16) => toSvg(ChevronLeft, s),
  ChevronDown:  (s=16) => toSvg(ChevronDown, s),
  ChevronUp:    (s=16) => toSvg(ChevronUp, s),

  // Tour features
  MapPin:       (s=18) => toSvg(MapPin, s),
  Map:          (s=20) => toSvg(Map, s),
  Hotel:        (s=20) => toSvg(Hotel, s),
  Bus:          (s=20) => toSvg(Bus, s),
  Compass:      (s=20) => toSvg(Compass, s),
  Shield:       (s=20) => toSvg(Shield, s),
  Star:         (s=16) => toSvg(Star, s),
  Users:        (s=20) => toSvg(Users, s),
  Clock:        (s=16) => toSvg(Clock, s),
  Calendar:     (s=16) => toSvg(CalendarDays, s),
  Ticket:       (s=18) => toSvg(Ticket, s),
  Camera:       (s=18) => toSvg(Camera, s),
  Mountain:     (s=20) => toSvg(Mountain, s),
  Waves:        (s=20) => toSvg(Waves, s),
  Sun:          (s=20) => toSvg(Sun, s),
  Heart:        (s=18) => toSvg(Heart, s),
  Sparkles:     (s=16) => toSvg(Sparkles, s),
  Award:        (s=20) => toSvg(Award, s),
  BadgeCheck:   (s=16) => toSvg(BadgeCheck, s),
  Navigation:   (s=18) => toSvg(Navigation, s),
  Anchor:       (s=20) => toSvg(Anchor, s),
  Building:     (s=20) => toSvg(Building2, s),

  // Contact
  Phone:        (s=16) => toSvg(Phone, s),
  Mail:         (s=16) => toSvg(Mail, s),
  Message:      (s=16) => toSvg(MessageCircle, s),

  // Admin & actions
  Search:       (s=18) => toSvg(Search, s),
  LogOut:       (s=16) => toSvg(LogOut, s),
  Settings:     (s=16) => toSvg(Settings, s),
  Dashboard:    (s=16) => toSvg(LayoutDashboard, s),
  Package:      (s=16) => toSvg(Package, s),
  Image:        (s=16) => toSvg(LucideImage, s),
  Save:         (s=16) => toSvg(Save, s),
  Download:     (s=16) => toSvg(Download, s),
  Trash:        (s=14) => toSvg(Trash2, s),
  Edit:         (s=14) => toSvg(Edit3, s),
  Plus:         (s=16) => toSvg(Plus, s),
  Check:        (s=16) => toSvg(Check, s),
  CheckCircle:  (s=20) => toSvg(CheckCircle2, s),
  Alert:        (s=18) => toSvg(AlertCircle, s),
  Info:         (s=18) => toSvg(Info, s),
  Lock:         (s=16) => toSvg(Lock, s),
  Palette:      (s=16) => toSvg(Palette, s),
  FileText:     (s=16) => toSvg(FileText, s),
  Palmtree:     (s=18) => toSvg(Palmtree, s),
  Crown:        (s=20) => toSvg(Crown, s),
  Gem:          (s=20) => toSvg(Gem, s),
}
