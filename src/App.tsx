import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { type Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase, type Booking, type Completion, type Profile } from "./lib/supabase";

type BillingCycle = "monthly" | "annual";
type AuthMode = "signup" | "signin";

type Workout = {
  slug: string;
  title: string;
  instructor: string;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  equipment: "Bodyweight" | "Dumbbells" | "Barbell" | "Bands";
  image: string;
  alt: string;
};

type OnboardingState = {
  goal: string;
  experience: string;
  equipment: string[];
  weekly_goal: number;
};

const heroImage =
  "https://images.pexels.com/photos/32695899/pexels-photo-32695899.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=1800";

const navigation = ["Workouts", "Coaches", "Pricing", "Dashboard"];

const workouts: Workout[] = [
  {
    slug: "hypertrophy-blueprint",
    title: "Hypertrophy Blueprint",
    instructor: "Marcus Vance",
    duration: 25,
    difficulty: "Beginner",
    equipment: "Bodyweight",
   image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop",
   alt: "Male athlete training in the gym.",
  },
  {
    slug: "strength-density",
    title: "CNS Strength Density",
    instructor: "Jordan Price",
    duration: 40,
    difficulty: "Intermediate",
    equipment: "Dumbbells",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop",
    alt: "Athlete lifting dumbbells in a modern gym.",
  },
  {
    slug: "barbell-engine",
    title: "Barbell Kinetic Engine",
    instructor: "Tasha Chase",
    duration: 55,
    difficulty: "Advanced",
    equipment: "Barbell",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&auto=format&fit=crop",
    alt: "Trainer spotting an athlete during barbell strength work.",
  },
  {
    slug: "mobility-reset",
    title: "Structural Mobility Reset",
    instructor: "Nia Brooks",
    duration: 30,
    difficulty: "Beginner",
    equipment: "Bands",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop",
    alt: "Athlete training with ropes near a coach in a gym.",
  },
  {
    slug: "power-lunch-lift",
    title: "Metabolic Conditioning",
    instructor: "Zara Brooks",
    duration: 35,
    difficulty: "Intermediate",
    equipment: "Bodyweight",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop",
    alt: "Group of athletes performing push-ups together in a gym.",
  },
  {
    slug: "heavy-hitter",
    title: "Mechanical Tension Peak",
    instructor: "Andre Miles",
    duration: 60,
    difficulty: "Advanced",
    equipment: "Dumbbells",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop",
    alt: "Athlete performing dumbbell curls in a gym.",
  },
];



const coaches = [
  {
    name: "Marcus Vance",
    role: "Biomechanics & Strength Lead",
    bio: "Specializing in fixing imbalances and moving efficiently.",
    image: "https://images.pexels.com/photos/5327477/pexels-photo-5327477.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=650&w=900"
  },
  {
    name: "Jordan Price",
    role: "CNS Performance Specialist",
    bio: "Optimizing central nervous system efficiency, velocity-based training, and athletic power development.",
    image: "https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=800"
  },
  {
    name: "Tasha Chase",
    role: "Olympic Lifting & Loading Master",
    bio: "Focused on structural force transmission, heavy barbell engineering, and compound mechanics.",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&auto=format&fit=crop"
  },

  {
    name: "Zara Brooks",
    role: "Metabolic Conditioning Master",
    bio: "Specializing in high-velocity conditioning, functional endurance, and core power dynamics.",
    image: "https://images.pexels.com/photos/13966201/pexels-photo-13966201.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=650&w=900" 
  },
  {
    name: "Nia Brooks",
    role: "Kinetic Longevity Specialist",
    bio: "Dedicated to soft-tissue restoration, connective tissue adaptation, and long-range mobility integration.",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop"
  },
];


const pricing = [
  {
    name: "Basic",
    monthly: 29,
    annual: 24,
    summary: "Best for beginners who want guided workouts and weekly progress tracking.",
    features: ["Starter workout library", "Beginner onboarding", "Class bookings", "Progress dashboard"],
  },
  {
    name: "Pro",
    monthly: 59,
    annual: 49,
    summary: "Best for members who want live classes, nutrition support, and accountability.",
    features: ["Everything in Basic", "Live class access", "Coach check-ins", "Nutrition templates"],
    popular: true,
  },
  {
    name: "Elite",
    monthly: 119,
    annual: 99,
    summary: "Best for serious transformations with personalized coaching and form review.",
    features: ["Everything in Pro", "1-on-1 coaching", "Custom macros", "Video form review"],
  },
];

const goalOptions = ["Build strength", "Lose fat", "Improve energy", "Move pain-free", "Stay consistent"];
const experienceOptions = ["Beginner", "Returning after a break", "Intermediate", "Advanced"];
const equipmentOptions = ["Bodyweight", "Dumbbells", "Bands", "Barbell"];
const publicationLogos = ["Men's Health", "Well+Good", "Outside", "Runner's Lab", "Self", "Gear Patrol"];

function SectionIntro({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
      <p className="text-sm font-black uppercase tracking-[0.35em] text-lime-300">{label}</p>
      <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-zinc-300 md:text-lg">{body}</p>
    </div>
  );
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function calculateStreak(completions: Completion[]) {
  const completedDates = new Set(completions.map((completion) => dateKey(new Date(completion.completed_at))));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!completedDates.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (completedDates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function startOfCurrentWeek() {
  const today = new Date();
  const start = new Date(today);
  const day = start.getDay();
  start.setDate(today.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    goal: "Build strength",
    experience: "Beginner",
    equipment: ["Bodyweight"],
    weekly_goal: 3,
  });
  const [durationFilter, setDurationFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [notice, setNotice] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Weak ❌", color: "bg-red-500 w-1/4" });

  function checkPasswordStrength(value: string) {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score <= 1) {
      setPasswordStrength({ score, label: "Weak ❌", color: "bg-red-500 w-1/4" });
    } else if (score === 2) {
      setPasswordStrength({ score, label: "Fair ⚠️", color: "bg-orange-500 w-2/4" });
    } else if (score === 3) {
      setPasswordStrength({ score, label: "Good ⚡", color: "bg-yellow-500 w-3/4" });
    } else if (score === 4) {
      setPasswordStrength({ score, label: "Strong 💪", color: "bg-lime-300 w-full" });
    }
  }
  const isSignedIn = Boolean(session);
  const firstName = profile?.full_name?.trim().split(" ")[0] || session?.user.email?.split("@")[0] || "Member";
  const weeklyGoal = profile?.weekly_goal ?? onboarding.weekly_goal;
  const weekStart = useMemo(() => startOfCurrentWeek(), []);
  const completedThisWeek = completions.filter((completion) => new Date(completion.completed_at) >= weekStart).length;
  const progressCount = Math.min(completedThisWeek, weeklyGoal);
  const progressPercent = Math.min(100, Math.round((progressCount / weeklyGoal) * 100));
  const streak = calculateStreak(completions);
  const hasFinishedOnboarding = Boolean(profile?.goal && profile?.experience);
    const recommendedWorkout = useMemo(() => {
    if (!profile || profile.experience === "Beginner") {
      return workouts.find((workout) => workout.difficulty === "Beginner") ?? workouts[0];
    }

    if (profile.goal?.toLowerCase().includes("strength")) {
      return workouts.find((workout) => workout.slug === "strength-density") ?? workouts[0];
    }

    return workouts.find((workout) => workout.slug === "mobility-reset") ?? workouts[0];
  }, [profile]);


  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const durationMatches =
        durationFilter === "All" ||
        (durationFilter === "Under 30" && workout.duration < 30) ||
        (durationFilter === "30-45" && workout.duration >= 30 && workout.duration <= 45) ||
        (durationFilter === "45+" && workout.duration > 45);
      const difficultyMatches = difficultyFilter === "All" || workout.difficulty === difficultyFilter;
      const equipmentMatches = equipmentFilter === "All" || workout.equipment === equipmentFilter;

      return durationMatches && difficultyMatches && equipmentMatches;
    });
  }, [durationFilter, difficultyFilter, equipmentFilter]);

  async function loadCloudData(userId: string) {
    if (!supabase) {
      return;
    }

    const [profileResult, bookingsResult, completionsResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("class_bookings").select("*").eq("user_id", userId).eq("status", "booked").order("created_at", { ascending: false }),
      supabase.from("workout_completions").select("*").eq("user_id", userId).order("completed_at", { ascending: false }),
    ]);

    if (profileResult.error) {
      setNotice(profileResult.error.message);
    } else {
      setProfile((profileResult.data as Profile | null) ?? null);
    }

    if (bookingsResult.error) {
      setNotice(bookingsResult.error.message);
    } else {
      setBookings((bookingsResult.data as Booking[]) ?? []);
    }

    if (completionsResult.error) {
      setNotice(completionsResult.error.message);
    } else {
      setCompletions((completionsResult.data as Completion[]) ?? []);
    }
  }

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        void loadCloudData(data.session.user.id);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (nextSession) {
        void loadCloudData(nextSession.user.id);
      } else {
        setProfile(null);
        setBookings([]);
        setCompletions([]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setBilling(profile.billing_cycle);
    setOnboarding({
      goal: profile.goal ?? "Build strength",
      experience: profile.experience ?? "Beginner",
      equipment: profile.equipment?.length ? profile.equipment : ["Bodyweight"],
      weekly_goal: profile.weekly_goal,
    });
  }, [profile]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(""), 5200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openAuth(mode: AuthMode) {
    if (!isSupabaseConfigured) {
      setNotice("Connect your dedicated Supabase project first. This build will not store member data in the browser.");
      document.getElementById("setup")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setAuthMode(mode);
    setAuthOpen(true);
  }

  function requireMember(action: string) {
    if (session) {
      return true;
    }

    setNotice(action);
    openAuth("signup");
    return false;
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setNotice("Supabase is not connected yet. Add your project URL and anon key to the environment.");
      return;
    }

    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;
    const fullName = authForm.name.trim();

    if (!email || password.length < 8) {
      setNotice("Use a valid email and a password with at least 8 characters.");
      return;
    }

    setIsBusy(true);

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        setNotice(error.message);
        setIsBusy(false);
        return;
      }

      if (data.session) {
        await supabase.from("profiles").upsert(
          {
            id: data.session.user.id,
            full_name: fullName,
            email,
            goal: onboarding.goal,
            experience: onboarding.experience,
            equipment: onboarding.equipment,
            weekly_goal: onboarding.weekly_goal,
          },
          { onConflict: "id" },
        );
        await loadCloudData(data.session.user.id);
        setNotice("Account created in the cloud. Finish your beginner setup below.");
      } else {
        setNotice("Account created. Check your email to confirm your login before continuing.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setNotice(error.message);
        setIsBusy(false);
        return;
      }

      if (data.session) {
        await loadCloudData(data.session.user.id);
        setNotice("Signed in. Your cloud dashboard is ready.");
      }
    }

    setAuthForm({ name: "", email: "", password: "" });
    setAuthOpen(false);
    setIsBusy(false);

    window.setTimeout(() => {
      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  async function saveBeginnerPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !session) {
      openAuth("signup");
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        id: session.user.id,
        full_name: profile?.full_name || session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "GAINS Member",
        email: session.user.email ?? "",
        goal: onboarding.goal,
        experience: onboarding.experience,
        equipment: onboarding.equipment,
        weekly_goal: onboarding.weekly_goal,
        plan: profile?.plan ?? "Basic",
        billing_cycle: profile?.billing_cycle ?? billing,
      },
      { onConflict: "id" },
    );

    if (error) {
      setNotice(error.message);
    } else {
      await loadCloudData(session.user.id);
      setNotice("Beginner plan saved to your cloud profile.");
    }

    setIsBusy(false);
  }

  async function toggleBooking(workout: Workout) {
    if (!requireMember("Create an account to book classes in your cloud profile.")) {
      return;
    }

    if (!supabase || !session) {
      return;
    }

    const existingBooking = bookings.find((booking) => booking.workout_slug === workout.slug);
    setIsBusy(true);

    if (existingBooking) {
      const { error } = await supabase.from("class_bookings").delete().eq("id", existingBooking.id);

      if (error) {
        setNotice(error.message);
      } else {
        setBookings((current) => current.filter((booking) => booking.id !== existingBooking.id));
        setNotice(`${workout.title} cancelled.`);
      }
    } else {
      const { data, error } = await supabase
        .from("class_bookings")
        .insert({
          user_id: session.user.id,
          workout_slug: workout.slug,
          workout_title: workout.title,
          instructor: workout.instructor,
          status: "booked",
        })
        .select()
        .single();

      if (error) {
        setNotice(error.message);
      } else {
        setBookings((current) => [data as Booking, ...current]);
        setNotice(`${workout.title} booked and saved in the cloud.`);
      }
    }

    setIsBusy(false);
  }

  async function completeWorkout(workout: Workout) {
    if (!requireMember("Create an account to track progress in your cloud profile.")) {
      return;
    }

    if (!supabase || !session) {
      return;
    }

    setIsBusy(true);
    const { data, error } = await supabase
      .from("workout_completions")
      .insert({
        user_id: session.user.id,
        workout_slug: workout.slug,
        workout_title: workout.title,
      })
      .select()
      .single();

    if (error) {
      setNotice(error.message);
      setIsBusy(false);
      return;
    }

    const bookedWorkout = bookings.find((booking) => booking.workout_slug === workout.slug);
    if (bookedWorkout) {
      await supabase.from("class_bookings").delete().eq("id", bookedWorkout.id);
    }

    setCompletions((current) => [data as Completion, ...current]);
    setBookings((current) => current.filter((booking) => booking.workout_slug !== workout.slug));
    setNotice(`${workout.title} completed. Your cloud progress was updated.`);
    setIsBusy(false);
  }

  async function choosePlan(plan: string) {
    if (!requireMember("Create an account before activating a membership.")) {
      return;
    }

    if (!supabase || !session) {
      return;
    }

    setIsBusy(true);
    const { error } = await supabase.from("profiles").update({ plan, billing_cycle: billing }).eq("id", session.user.id);

    if (error) {
      setNotice(error.message);
    } else {
      await loadCloudData(session.user.id);
      setNotice(`${plan} ${billing} membership saved. Connect Stripe Checkout before taking live payments.`);
    }

    setIsBusy(false);
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setProfile(null);
    setBookings([]);
    setCompletions([]);
    setNotice("Signed out securely.");
  }

  function toggleEquipment(item: string) {
    setOnboarding((current) => {
      const exists = current.equipment.includes(item);
      return {
        ...current,
        equipment: exists ? current.equipment.filter((equipment) => equipment !== item) : [...current.equipment, item],
      };
    });
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-lime-300 selection:text-black">
      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/35 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-2xl md:px-6">
          <a href="#top" className="flex items-center gap-3" aria-label="GAINS homepage">
            <span className="h-3 w-3 rounded-full bg-lime-300 shadow-[0_0_22px_rgba(182,255,63,0.9)]" />
            <span className="gains-display text-xl font-black tracking-[-0.08em] text-white">GAINS</span>
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-zinc-300 transition hover:text-white">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isSignedIn ? (
              <>
                <a href="#dashboard" className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-black text-white transition hover:border-lime-300 hover:text-lime-300">
                  Hi, {firstName}
                </a>
                <button type="button" onClick={signOut} className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-lime-300">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => openAuth("signin")} className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-black text-white transition hover:border-lime-300 hover:text-lime-300">
                  Sign In
                </button>
                <button type="button" onClick={() => openAuth("signup")} className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-black text-black transition hover:bg-white">
                  Start Free
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </span>
          </button>
        </nav>

        {mobileOpen ? (
          <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-white/10 bg-black/85 p-5 backdrop-blur-2xl lg:hidden">
            <div className="grid gap-3">
              {navigation.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-3 text-sm font-bold text-zinc-200 hover:bg-white/10">
                  {item}
                </a>
              ))}
              {isSignedIn ? (
                <button type="button" onClick={signOut} className="rounded-2xl bg-white px-3 py-3 text-center text-sm font-black text-black">
                  Sign Out
                </button>
              ) : (
                <button type="button" onClick={() => openAuth("signup")} className="rounded-2xl bg-lime-300 px-3 py-3 text-center text-sm font-black text-black">
                  Start Free
                </button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      {notice ? (
        <div className="fixed left-1/2 top-24 z-[70] w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 rounded-full border border-lime-300/40 bg-black/85 px-5 py-3 text-center text-sm font-bold text-white shadow-2xl shadow-black/40 backdrop-blur-2xl" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}

      <main id="top">
        <section className="relative flex min-h-screen items-end overflow-hidden">
          <div className="hero-bg absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} role="img" aria-label="Athletes training together in a modern gym." />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(182,255,63,0.24),transparent_24%),linear-gradient(90deg,rgba(0,0,0,0.94),rgba(0,0,0,0.48)_52%,rgba(0,0,0,0.2))]" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-36 md:px-8 lg:pb-28">
            <div className="max-w-4xl animate-rise">
              <p className="gains-display text-[clamp(5rem,18vw,16rem)] font-black leading-[0.72] tracking-[-0.12em] text-white drop-shadow-2xl">
                GAINS
              </p>
              <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">
                Beginner-friendly fitness with real cloud accounts.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 md:text-xl">
                Sign up with your own email, save your beginner plan, book workouts, track completions, and keep member data in a dedicated Supabase cloud database.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => openAuth("signup")} className="rounded-full bg-lime-300 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white">
                  Create Your Account
                </button>
                <a href="#dashboard" className="rounded-full border border-white/25 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black">
                  View Member App
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#090a0d] px-5 py-16 md:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden py-3">
            <div className="ticker border-y border-white/10 py-5" aria-label="Featured publication logos">
              <div className="ticker-track">
                {[...publicationLogos, ...publicationLogos].map((logo, index) => (
                  <span key={`${logo}-${index}`} className="mx-8 text-2xl font-black uppercase tracking-[-0.04em] text-white/80">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="dashboard" className="px-5 py-24 md:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              label="Real member app"
              title="A first-time user flow, not a predetermined account."
              body="New members create their own account, answer beginner setup questions, and immediately get a cloud-saved plan, bookings, progress, and membership status."
            />

            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <form onSubmit={saveBeginnerPlan} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-lime-300">Beginner setup</p>
                <h3 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white">Tell GAINS how to start you safely.</h3>
                <p className="mt-4 leading-7 text-zinc-300">
                  This onboarding is intentionally simple. A beginner should not need to understand programming blocks, macros, or advanced periodization before their first workout.
                </p>

                <div className="mt-7 grid gap-5">
                  <label className="grid gap-2 text-sm font-bold text-zinc-300">
                    Main goal
                    <select value={onboarding.goal} onChange={(event) => setOnboarding((current) => ({ ...current, goal: event.target.value }))} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-lime-300">
                      {goalOptions.map((goal) => (
                        <option key={goal}>{goal}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-bold text-zinc-300">
                    Experience level
                    <select value={onboarding.experience} onChange={(event) => setOnboarding((current) => ({ ...current, experience: event.target.value }))} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-lime-300">
                      {experienceOptions.map((experience) => (
                        <option key={experience}>{experience}</option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <p className="text-sm font-bold text-zinc-300">Available equipment</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {equipmentOptions.map((equipment) => {
                        const selected = onboarding.equipment.includes(equipment);
                        return (
                          <button
                            key={equipment}
                            type="button"
                            onClick={() => toggleEquipment(equipment)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${selected ? "border-lime-300 bg-lime-300 text-black" : "border-white/10 bg-black text-white hover:border-lime-300"}`}
                          >
                            {equipment}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="grid gap-2 text-sm font-bold text-zinc-300">
                    Weekly training goal: {onboarding.weekly_goal} sessions
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={onboarding.weekly_goal}
                      onChange={(event) => setOnboarding((current) => ({ ...current, weekly_goal: Number(event.target.value) }))}
                      className="accent-lime-300"
                    />
                  </label>
                </div>

                <button type="submit" disabled={isBusy} className="mt-8 w-full rounded-full bg-lime-300 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                  {isSignedIn ? "Save Beginner Plan" : "Create Account To Save"}
                </button>
              </form>

              <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 md:p-8">
                {isSignedIn ? (
                  <>
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-lime-300">Cloud dashboard</p>
                        <h3 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">Welcome, {firstName}.</h3>
                        <p className="mt-4 text-zinc-300">{session?.user.email}</p>
                      </div>
                      <button type="button" onClick={signOut} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-lime-300 hover:text-lime-300">
                        Sign Out
                      </button>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      {[
                        ["Plan", profile ? `${profile.plan} / ${profile.billing_cycle}` : "Not chosen"],
                        ["Streak", `${streak} days`],
                        ["Bookings", `${bookings.length} active`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                          <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Weekly progress</p>
                          <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">{progressCount}/{weeklyGoal} sessions</p>
                        </div>
                        <div className="grid h-16 w-16 place-items-center rounded-full bg-lime-300 text-lg font-black text-black">{progressPercent}%</div>
                      </div>
                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                        <div className="meter-fill h-full rounded-full bg-lime-300" style={{ "--meter-width": `${progressPercent}%` } as CSSProperties} />
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={() => completeWorkout(recommendedWorkout)} disabled={isBusy} className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-60">
                          Complete {recommendedWorkout.title}
                        </button>
                        <a href="#workouts" className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-lime-300 hover:text-lime-300">
                          Find Another Workout
                        </a>
                      </div>
                    </div>

                    {!hasFinishedOnboarding ? (
                      <p className="mt-5 rounded-3xl border border-lime-300/25 bg-lime-300/10 p-4 text-sm font-bold leading-6 text-lime-100">
                        Finish the beginner setup form to personalize recommendations and save your starter plan in the cloud.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="grid min-h-[32rem] place-items-center text-center">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.25em] text-lime-300">No signed-in user</p>
                      <h3 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">Create your own account.</h3>
                      <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-zinc-300">
                        There is no predetermined profile. Each user signs up with their own email and password, and the account is stored in your dedicated Supabase Auth project.
                      </p>
                      <button type="button" onClick={() => openAuth("signup")} className="mt-8 rounded-full bg-lime-300 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white">
                        Start As A Beginner
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="workouts" className="border-y border-white/10 bg-[#090a0d] px-5 py-24 md:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              label="Workout library"
              title="Choose by time, level, and equipment."
              body="A beginner should be able to pick a workout in seconds. Filters remove uncertainty and every action writes to the member's cloud account once signed in."
            />

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 md:p-5">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  Duration
                  <select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-lime-300">
                    {['All', 'Under 30', '30-45', '45+'].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  Difficulty
                  <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-lime-300">
                    {['All', 'Beginner', 'Intermediate', 'Advanced'].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  Equipment
                  <select value={equipmentFilter} onChange={(event) => setEquipmentFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-lime-300">
                    {['All', 'Bodyweight', 'Dumbbells', 'Barbell', 'Bands'].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredWorkouts.map((workout) => {
                const isBooked = bookings.some((booking) => booking.workout_slug === workout.slug);
                return (
                  <article key={workout.slug} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-lime-300/60">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={workout.image} alt={workout.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.18em] text-lime-300">
                        <span>{workout.duration} min</span>
                        <span>{workout.difficulty}</span>
                        <span>{workout.equipment}</span>
                      </div>
                      <h3 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white">{workout.title}</h3>
                      <p className="mt-2 text-zinc-400">Instructor: {workout.instructor}</p>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <button type="button" onClick={() => toggleBooking(workout)} disabled={isBusy} className={`rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.16em] transition disabled:opacity-60 ${isBooked ? "bg-lime-300 text-black" : "bg-white text-black hover:bg-lime-300"}`}>
                          {isBooked ? "Booked" : "Book Class"}
                        </button>
                        <button type="button" onClick={() => completeWorkout(workout)} disabled={isBusy} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-lime-300 hover:text-lime-300 disabled:opacity-60">
                          Mark Done
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="coaches" className="px-5 py-24 md:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              label="Coaches"
              title="Human guidance before intensity."
              body="Coach profiles emphasize safety, progression, and confidence so beginners feel supported instead of judged."
            />

            <div className="grid gap-6 md:grid-cols-3">
              {coaches.map((coach) => (
                <article key={coach.name} className="flip-card h-[31rem]" tabIndex={0} aria-label={`${coach.name}, ${coach.role}`}>
                  <div className="flip-card-inner">
                    <div className="flip-face overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
                      <img src={coach.image} alt={coach.alt} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                        <h3 className="text-3xl font-black tracking-[-0.05em] text-white">{coach.name}</h3>
                        <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-lime-300">{coach.role}</p>
                      </div>
                    </div>
                    <div className="flip-face flip-back rounded-[2rem] border border-lime-300/60 bg-lime-300 p-6 text-black">
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-black/60">Coach profile</p>
                      <h3 className="mt-5 text-4xl font-black tracking-[-0.06em]">{coach.name}</h3>
                      <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-black/60">Certifications</p>
                      <p className="mt-2 font-bold">{coach.certs}</p>
                      <p className="mt-6 text-lg font-black leading-7">{coach.bio}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-y border-white/10 bg-[#090a0d] px-5 py-24 md:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              label="Membership"
              title="Pick a plan and save it to your profile."
              body="The plan selector writes to the user's cloud profile. Stripe Checkout should be connected before live payment collection."
            />

            <div className="mb-10 flex justify-center">
              <div className="rounded-full border border-white/10 bg-white/[0.04] p-1">
                {(['monthly', 'annual'] as BillingCycle[]).map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBilling(cycle)}
                    className={`rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${billing === cycle ? "bg-lime-300 text-black" : "text-zinc-300 hover:text-white"}`}
                  >
                    {cycle === "monthly" ? "Monthly" : "Annual"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 lg:items-center">
              {pricing.map((tier) => {
                const price = billing === "monthly" ? tier.monthly : tier.annual;
                const isCurrent = profile?.plan === tier.name && profile.billing_cycle === billing;

                return (
                  <article key={tier.name} className={`relative rounded-[2rem] border p-7 transition duration-300 ${tier.popular ? "scale-[1.02] border-lime-300 bg-lime-300 text-black shadow-[0_0_80px_rgba(182,255,63,0.24)] lg:scale-105" : "border-white/10 bg-white/[0.04] text-white"}`}>
                    {tier.popular ? (
                      <p className="mb-5 inline-flex rounded-full bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-300">Most Popular</p>
                    ) : null}
                    <h3 className="text-4xl font-black tracking-[-0.06em]">{tier.name}</h3>
                    <p className={`mt-4 min-h-16 leading-7 ${tier.popular ? "text-black/75" : "text-zinc-300"}`}>{tier.summary}</p>
                    <div className="mt-7 flex items-end gap-2">
                      <span className="text-6xl font-black tracking-[-0.08em]">${price}</span>
                      <span className={`pb-2 text-sm font-bold uppercase tracking-[0.16em] ${tier.popular ? "text-black/60" : "text-zinc-500"}`}>/mo</span>
                    </div>
                    <ul className="mt-8 space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-3 font-bold">
                          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tier.popular ? "bg-black" : "bg-lime-300"}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => choosePlan(tier.name)} disabled={isBusy} className={`mt-8 w-full rounded-full px-5 py-4 text-sm font-black uppercase tracking-[0.18em] transition disabled:opacity-60 ${tier.popular ? "bg-black text-white hover:bg-white hover:text-black" : "bg-white text-black hover:bg-lime-300"}`}>
                      {isCurrent ? "Current Plan" : `Choose ${tier.name}`}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

                {/* Testimonials / Social Proof Section */}
        <section className="border-t border-white/5 bg-zinc-950/40 py-20 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">Proven Results</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
              Built by Logic. Backed by Performance.
            </h2>
            
            <div className="mt-12 grid gap-6 sm:grid-cols-2 text-left">
              <div className="rounded-[2rem] border border-white/5 bg-black p-6 transition duration-300 hover:border-lime-300/20 md:p-8">
                <p className="text-zinc-300 text-sm leading-relaxed md:text-base">
                  "The tracking logic is seamless. Down 12lbs of body fat while increasing my compound lifts. This isn't a basic, bloated fitness tracker—it's a clean performance system."
                </p>
                <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white">
                  — David K., Software Engineer
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/5 bg-black p-6 transition duration-300 hover:border-lime-300/20 md:p-8">
                <p className="text-zinc-300 text-sm leading-relaxed md:text-base">
                  "Most fitness platforms are choked with unnecessary UI garbage and marketing fluff. This layout gets straight to the point: raw performance metrics and clean scheduling."
                </p>
                <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white">
                  — Sarah M., Systems Analyst
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {authOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 px-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#090a0d] p-6 shadow-2xl shadow-black/50 md:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-lime-300">Member access</p>
                <h2 id="auth-title" className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
                  {authMode === "signup" ? "Create your real account." : "Sign in to GAINS."}
                </h2>
              </div>
              <button type="button" onClick={() => setAuthOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white transition hover:border-lime-300 hover:text-lime-300" aria-label="Close member access dialog">
                X
              </button>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleAuthSubmit}>
              {authMode === "signup" ? (
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  Full name
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-300"
                    placeholder="Your name"
                    required
                  />
                </label>
              ) : null}

              <label className="grid gap-2 text-sm font-bold text-zinc-300">
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-300"
                  placeholder="you@example.com"
                  required
                />
              </label>

                           <div className="grid gap-2 text-sm font-bold text-zinc-300">
                <label htmlFor="auth-password">Password</label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    value={authForm.password}
                    onChange={(event) => {
                      const val = event.target.value;
                      setAuthForm((current) => ({ ...current, password: val }));
                      checkPasswordStrength(val);
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 pr-12 text-white outline-none transition focus:border-lime-300"
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {authForm.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Strength:</span>
                      <span className="font-bold text-zinc-200">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full ${passwordStrength.color} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>


              <div className="rounded-3xl border border-lime-300/25 bg-lime-300/10 p-4 text-sm leading-6 text-zinc-300">
                No predetermined account is used. User authentication is handled by Supabase Auth, and member information is written to cloud database tables protected by row-level security.
              </div>

              <button type="submit" disabled={isBusy} className="w-full rounded-full bg-lime-300 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                {isBusy ? "Working..." : authMode === "signup" ? "Create Account" : "Sign In"}
              </button>
            </form>

            <button type="button" onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")} className="mt-5 w-full text-center text-sm font-black uppercase tracking-[0.18em] text-lime-300">
              {authMode === "signup" ? "Already have an account? Sign In" : "New to GAINS? Create Account"}
            </button>
          </div>
        </div>
      ) : null}

      <aside className="progress-widget fixed bottom-5 right-5 z-40 w-[min(20rem,calc(100vw-2rem))] rounded-[1.6rem] border border-white/10 bg-black/75 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl" aria-label="Member progress tracker">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-300">{isSignedIn ? "Cloud progress" : "Progress tracker"}</p>
            <p className="mt-1 text-xl font-black tracking-[-0.04em] text-white">{isSignedIn ? `${streak} day streak` : "Create account"}</p>
          </div>
          <div className="pulse-ring grid h-12 w-12 place-items-center rounded-full bg-lime-300 text-sm font-black text-black">
            {progressCount}/{weeklyGoal}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="meter-fill h-full rounded-full bg-lime-300" style={{ "--meter-width": `${progressPercent}%` } as CSSProperties} />
        </div>
        <p className="mt-3 text-sm text-zinc-300">
          {isSignedIn ? `Next action: ${recommendedWorkout.title}.` : "Sign up to save your progress in the cloud."}
        </p>
        <button type="button" onClick={isSignedIn ? () => completeWorkout(recommendedWorkout) : () => openAuth("signup")} disabled={isBusy} className="mt-3 w-full rounded-full bg-lime-300 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-60">
          {isSignedIn ? "Mark Next Done" : "Start Free"}
        </button>
      </aside>
    </div>
  );
}
