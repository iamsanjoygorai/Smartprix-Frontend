"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

/* =========================================================
   TYPES
========================================================= */

interface AdminUser {
  id: string;
  email: string | null;
  mobile: string | null;
  name: string | null;
  role: string;
  isDisabled: boolean;
  dateOfBirth: string | null;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  active: number;
  disabled: number;
  admins: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    stats: UserStats;
    pagination: Pagination;
  };
  message?: string;
}

interface PermissionUser {
  id?: string;
  role?: string;
  permissions?: string[];
}

interface UserForm {
  name: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const PAGE_SIZE = 20;

/* =========================================================
   ICONS
========================================================= */

function Icon({
  name,
  size = 18,
}: {
  name:
    | "users"
    | "search"
    | "filter"
    | "refresh"
    | "eye"
    | "edit"
    | "lock"
    | "unlock"
    | "trash"
    | "chevron-left"
    | "chevron-right"
    | "x"
    | "check"
    | "calendar"
    | "mail"
    | "phone"
    | "shield"
    | "history"
    | "sort"
    | "user"
    | "close";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-15.5-3" />
          <path d="M4 4v4h4" />
          <path d="M4 13a8.1 8.1 0 0 0 15.5 3" />
          <path d="M20 20v-4h-4" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "edit":
        return (
          <svg {...common}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </svg>
        );

    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );

    case "unlock":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 7.5-2" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    case "chevron-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );

    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case "x":
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      );

    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.9v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.28-1.27a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.9Z" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "sort":
      return (
        <svg {...common}>
          <path d="M8 6h12" />
          <path d="M8 12h9" />
          <path d="M8 18h6" />
          <path d="M4 6v12" />
          <path d="m2 8 2-2 2 2" />
          <path d="m2 16 2 2 2-2" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );

      case "history":
  return (
    <svg {...common}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );

    default:
      return null;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(user: AdminUser) {
  const name = user.name?.trim();

  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  if (user.mobile) {
    return user.mobile.slice(-2);
  }

  return "U";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDateInputValue(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function roleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "EDITOR":
      return "Editor";
    case "USER":
      return "User";
    default:
      return role || "User";
  }
}

function roleClass(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "ADMIN":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "EDITOR":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    disabled: 0,
    admins: 0,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] =
    useState<PermissionUser | null>(null);

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const [modalMode, setModalMode] =
    useState<"view" | "edit" | null>(null);

  const [confirmAction, setConfirmAction] = useState<
    | {
        type: "disable" | "enable" | "delete";
        user: AdminUser;
      }
    | null
  >(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /* =======================================================
     LOAD CURRENT ADMIN
  ======================================================= */

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("smartprix_user");

      if (rawUser) {
        setCurrentUser(JSON.parse(rawUser));
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const hasPermission = useCallback(
    (permission: string) => {
      if (isSuperAdmin) return true;

      return (
        currentUser?.permissions?.includes(permission) ?? false
      );
    },
    [currentUser, isSuperAdmin],
  );

  const canEdit = hasPermission("users.update");
  const canDisable = hasPermission("users.disable");
  const canDelete = hasPermission("users.delete");

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, [searchInput]);

  /* =======================================================
     FETCH USERS
  ======================================================= */

  const fetchUsers = useCallback(
    async (showRefresh = false) => {
      const token = localStorage.getItem("smartprix_token");

      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      params.set("page", String(pagination.page));
      params.set("limit", String(PAGE_SIZE));

      if (search) {
        params.set("search", search);
      }

      if (role !== "ALL") {
        params.set("role", role);
      }

      if (status !== "ALL") {
        params.set("status", status.toLowerCase());
      }

      if (sort) {
        params.set("sort", sort);
      }

      try {
        const response = await fetch(
          `${API_URL}/admin/users?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load users",
          );
        }

        /*
         * =====================================================
         * CURRENT BACKEND RESPONSE
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         * =====================================================
         */

        const usersData: AdminUser[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.users)
            ? result.data.users
            : [];

        setUsers(usersData);

        /*
         * =====================================================
         * USE BACKEND STATS IF AVAILABLE.
         * OTHERWISE CALCULATE FROM CURRENT RESULT.
         * =====================================================
         */

        if (result.data?.stats) {
          setStats(result.data.stats);
        } else {
          const total = usersData.length;

          const active = usersData.filter(
            (user) => !user.isDisabled,
          ).length;

          const disabled = usersData.filter(
            (user) => user.isDisabled,
          ).length;

          const admins = usersData.filter(
            (user) =>
              user.role === "ADMIN" ||
              user.role === "SUPER_ADMIN",
          ).length;

          setStats({
            total,
            active,
            disabled,
            admins,
          });
        }

        /*
         * =====================================================
         * USE BACKEND PAGINATION IF AVAILABLE.
         * OTHERWISE CREATE PAGINATION FOR CURRENT RESPONSE.
         * =====================================================
         */

        if (result.data?.pagination) {
          setPagination(result.data.pagination);
        } else {
          const total = usersData.length;

          setPagination((previous) => ({
            ...previous,
            page: previous.page,
            limit: PAGE_SIZE,
            total,
            totalPages:
              total > 0
                ? Math.ceil(total / PAGE_SIZE)
                : 0,
            hasNextPage:
              previous.page <
              Math.ceil(total / PAGE_SIZE),
            hasPreviousPage:
              previous.page > 1,
          }));
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      pagination.page,
      role,
      search,
      sort,
      status,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!cancelled) {
        await fetchUsers();
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchUsers]);

  /* =======================================================
     RESET PAGE WHEN FILTERS CHANGE
  ======================================================= */

  useEffect(() => {
    setPagination((previous) => {
      if (previous.page === 1) {
        return previous;
      }

      return {
        ...previous,
        page: 1,
      };
    });
  }, [search, role, status, sort]);

  /* =======================================================
     NOTICE
  ======================================================= */

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [notice]);

  /* =======================================================
     OPEN VIEW / EDIT
  ======================================================= */

  const openUser = (
    user: AdminUser,
    mode: "view" | "edit",
  ) => {
    setSelectedUser(user);
    setModalMode(mode);

    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      mobile: user.mobile ?? "",
      dateOfBirth: getDateInputValue(user.dateOfBirth),
      gender: user.gender ?? "",
    });
  };

  const closeModal = () => {
    if (actionLoading) return;

    setSelectedUser(null);
    setModalMode(null);
  };

  /* =======================================================
     UPDATE USER
  ======================================================= */

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedUser) return;

    const token = localStorage.getItem("smartprix_token");

    if (!token) {
      setNotice({
        type: "error",
        text: "Authentication token not found.",
      });
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            mobile: form.mobile,
            dateOfBirth: form.dateOfBirth || null,
            gender: form.gender || null,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update user",
        );
      }

      setNotice({
        type: "success",
        text: "User updated successfully.",
      });

      closeModal();
      await fetchUsers(true);
    } catch (err) {
      setNotice({
        type: "error",
        text: getErrorMessage(err),
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     STATUS / DELETE
  ======================================================= */

  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    const token = localStorage.getItem("smartprix_token");

    if (!token) {
      setNotice({
        type: "error",
        text: "Authentication token not found.",
      });
      return;
    }

    setActionLoading(true);

    try {
      let response: Response;

      if (confirmAction.type === "delete") {
        response = await fetch(
          `${API_URL}/admin/users/${confirmAction.user.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        response = await fetch(
          `${API_URL}/admin/users/${confirmAction.user.id}/status`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              disabled: confirmAction.type === "disable",
            }),
          },
        );
      }

      const result = await response.json();//////////////////

      if (!response.ok) {
        throw new Error(
          result.message || "Action failed",
        );
      }

      const successMessage =
        confirmAction.type === "delete"
          ? "User deleted successfully."
          : confirmAction.type === "disable"
            ? "User disabled successfully."
            : "User enabled successfully.";

      setNotice({
        type: "success",
        text: successMessage,
      });

      setConfirmAction(null);

      await fetchUsers(true);
    } catch (err) {
      setNotice({
        type: "error",
        text: getErrorMessage(err),
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }

    setPagination((previous) => ({
      ...previous,
      page,
    }));
  };

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    if (totalPages <= 1) {
      return [];
    }

    const pages = new Set<number>();

    pages.add(1);
    pages.add(totalPages);

    for (
      let page = currentPage - 1;
      page <= currentPage + 1;
      page++
    ) {
      if (page >= 1 && page <= totalPages) {
        pages.add(page);
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }, [pagination.page, pagination.totalPages]);

  /* =======================================================
     FILTER ACTIONS
  ======================================================= */

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRole("ALL");
    setStatus("ALL");
    setSort("newest");

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  const hasFilters =
    Boolean(search) ||
    role !== "ALL" ||
    status !== "ALL" ||
    sort !== "newest";

  /* =======================================================
     STATS
  ======================================================= */

  const statCards = [
    {
      label: "Total Users",
      value: stats.total,
      icon: "users" as const,
      iconClass:
        "bg-indigo-100 text-indigo-600",
      cardClass:
        "from-indigo-50 via-white to-white",
      action: () => setStatus("ALL"),
    },
    {
      label: "Active Users",
      value: stats.active,
      icon: "check" as const,
      iconClass:
        "bg-emerald-100 text-emerald-600",
      cardClass:
        "from-emerald-50 via-white to-white",
      action: () => setStatus("ACTIVE"),
    },
    {
      label: "Disabled Users",
      value: stats.disabled,
      icon: "lock" as const,
      iconClass:
        "bg-rose-100 text-rose-600",
      cardClass:
        "from-rose-50 via-white to-white",
      action: () => setStatus("DISABLED"),
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: "shield" as const,
      iconClass:
        "bg-violet-100 text-violet-600",
      cardClass:
        "from-violet-50 via-white to-white",
      action: () => {
        setRole("ADMIN");
        setStatus("ALL");
      },
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            User Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Users
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Manage registered users, account status and profile
            information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              <Icon name="refresh" size={16} />
            </span>
            Refresh
          </button>
        </div>
      </div>

      {/* ===================================================
          NOTICE
      =================================================== */}

      {notice && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
            <Icon
              name={
                notice.type === "success"
                  ? "check"
                  : "x"
              }
              size={15}
            />
          </span>

          <span className="flex-1">
            {notice.text}
          </span>

          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded-lg p-1 transition hover:bg-black/5"
          >
            <Icon name="x" size={15} />
          </button>
        </div>
      )}

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={card.action}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${card.cardClass} p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {card.value.toLocaleString("en-IN")}
                </p>
              </div>

              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                <Icon name={card.icon} size={20} />
              </span>
            </div>

            <div className="absolute -bottom-7 -right-7 h-20 w-20 rounded-full bg-white/50 transition group-hover:scale-125" />
          </button>
        ))}
      </div>

      {/* ===================================================
          FILTER BAR
      =================================================== */}

      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon name="filter" size={17} />
              </span>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  User filters
                </h2>

                <p className="text-xs text-slate-500">
                  Search and refine the user list.
                </p>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 lg:self-auto"
              >
                <Icon name="x" size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-[minmax(250px,1.5fr)_180px_180px_190px]">
          {/* Search */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={17} />
            </span>

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search name, email or mobile..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          {/* Role */}
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPagination((previous) => ({
                ...previous,
                page: 1,
              }));
            }}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="ALL">All roles</option>
            <option value="USER">Users</option>
            <option value="EDITOR">Editors</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">
              Super Admins
            </option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPagination((previous) => ({
                ...previous,
                page: 1,
              }));
            }}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>

          {/* Sort */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="sort" size={16} />
            </span>

            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPagination((previous) => ({
                  ...previous,
                  page: 1,
                }));
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="newest">
                Newest first
              </option>
              <option value="oldest">
                Oldest first
              </option>
              <option value="name-asc">
                Name A → Z
              </option>
              <option value="name-desc">
                Name Z → A
              </option>
              <option value="email-asc">
                Email A → Z
              </option>
              <option value="email-desc">
                Email Z → A
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchUsers(true)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Registered users
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {pagination.total.toLocaleString("en-IN")}{" "}
              {pagination.total === 1
                ? "user"
                : "users"}{" "}
              found
            </p>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {search && (
                <FilterChip
                  label={`Search: ${search}`}
                  onRemove={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                />
              )}

              {role !== "ALL" && (
                <FilterChip
                  label={`Role: ${roleLabel(role)}`}
                  onRemove={() => setRole("ALL")}
                />
              )}

              {status !== "ALL" && (
                <FilterChip
                  label={`Status: ${
                    status === "ACTIVE"
                      ? "Active"
                      : "Disabled"
                  }`}
                  onRemove={() => setStatus("ALL")}
                />
              )}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingTable />
        ) : users.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={clearFilters}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const isSelf =
                      currentUser?.id === user.id;

                    const isTargetSuperAdmin =
                      user.role === "SUPER_ADMIN";

                    return (
                      <tr
                        key={user.id}
                        className="group transition hover:bg-slate-50/70"
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${
                                  isTargetSuperAdmin
                                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                                    : user.role ===
                                        "ADMIN"
                                      ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                                      : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700"
                                }`}
                              >
                                {getInitials(user)}
                              </div>

                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                                  user.isDisabled
                                    ? "bg-rose-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="max-w-[220px] truncate text-sm font-bold text-slate-900">
                                  {user.name ||
                                    "Unnamed user"}
                                </p>

                                {isSelf && (
                                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                                    You
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 text-xs text-slate-400">
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            {user.email ? (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Icon
                                  name="mail"
                                  size={13}
                                />
                                <span className="max-w-[230px] truncate">
                                  {user.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No email
                              </span>
                            )}

                            {user.mobile && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Icon
                                  name="phone"
                                  size={13}
                                />
                                {user.mobile}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${roleClass(
                              user.role,
                            )}`}
                          >
                            {user.role ===
                              "SUPER_ADMIN" && (
                              <span className="mr-1">
                                ★
                              </span>
                            )}
                            {roleLabel(user.role)}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          {user.isDisabled ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Disabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* JOINED */}
                        <td className="px-5 py-4">
                          <div className="text-xs font-semibold text-slate-700">
                            {formatDate(
                              user.createdAt,
                            )}
                          </div>

                          <div className="mt-0.5 text-[10px] text-slate-400">
                            {formatDateTime(
                              user.createdAt,
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1.5">
                            <ActionButton
                              label="View"
                              onClick={() =>
                                openUser(
                                  user,
                                  "view",
                                )
                              }
                            >
                              <Icon
                                name="eye"
                                size={15}
                              />
                            </ActionButton>
                            <Link
  href={`/admin/users/${user.id}/history`}
  title="History"
  aria-label={`View history for ${
    user.name || "this user"
  }`}
  className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-600 transition hover:border-cyan-200 hover:bg-cyan-100"
>
  <Icon name="history" size={15} />
</Link>

                            {canEdit &&
                              (!isTargetSuperAdmin ||
                                isSuperAdmin) && (
                                <ActionButton
                                  label="Edit"
                                  onClick={() =>
                                    openUser(
                                      user,
                                      "edit",
                                    )
                                  }
                                  variant="indigo"
                                >
                                  <Icon
                                    name="edit"
                                    size={15}
                                  />
                                </ActionButton>
                              )}

                            {canDisable &&
                              !isSelf &&
                              !isTargetSuperAdmin && (
                                <ActionButton
                                  label={
                                    user.isDisabled
                                      ? "Enable"
                                      : "Disable"
                                  }
                                  onClick={() =>
                                    setConfirmAction({
                                      type:
                                        user.isDisabled
                                          ? "enable"
                                          : "disable",
                                      user,
                                    })
                                  }
                                  variant={
                                    user.isDisabled
                                      ? "green"
                                      : "amber"
                                  }
                                >
                                  <Icon
                                    name={
                                      user.isDisabled
                                        ? "unlock"
                                        : "lock"
                                    }
                                    size={15}
                                  />
                                </ActionButton>
                              )}

                            {canDelete &&
                              !isSelf &&
                              !isTargetSuperAdmin && (
                                <ActionButton
                                  label="Delete"
                                  onClick={() =>
                                    setConfirmAction({
                                      type: "delete",
                                      user,
                                    })
                                  }
                                  variant="red"
                                >
                                  <Icon
                                    name="trash"
                                    size={15}
                                  />
                                </ActionButton>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-700">
                  {pagination.total === 0
                    ? 0
                    : (pagination.page - 1) *
                        pagination.limit +
                      1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-700">
                  {Math.min(
                    pagination.page *
                      pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">
                  {pagination.total}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    goToPage(pagination.page - 1)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon
                    name="chevron-left"
                    size={16}
                  />
                </button>

                {pageNumbers.map(
                  (page, index) => {
                    const previous =
                      pageNumbers[index - 1];

                    const showDots =
                      previous !== undefined &&
                      page - previous > 1;

                    return (
                      <div
                        key={page}
                        className="flex items-center"
                      >
                        {showDots && (
                          <span className="px-2 text-xs text-slate-400">
                            ...
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            goToPage(page)
                          }
                          className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold transition ${
                            pagination.page ===
                            page
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                              : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  },
                )}

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    goToPage(pagination.page + 1)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon
                    name="chevron-right"
                    size={16}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          USER MODAL
      ===================================================== */}

      {selectedUser && modalMode && (
        <Modal
          title={
            modalMode === "view"
              ? "User details"
              : "Edit user"
          }
          subtitle={
            modalMode === "view"
              ? "Review this account's profile and status."
              : "Update profile information. Role management stays in Admin Management."
          }
          onClose={closeModal}
        >
          {modalMode === "view" ? (
            <UserDetails
              user={selectedUser}
              onClose={closeModal}
              onEdit={
                canEdit &&
                (selectedUser.role !==
                  "SUPER_ADMIN" ||
                  isSuperAdmin)
                  ? () =>
                      setModalMode("edit")
                  : undefined
              }
            />
          ) : (
            <form
              onSubmit={handleUpdate}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Full name">
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Gender">
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        gender: event.target.value,
                      }))
                    }
                    className="form-input"
                  >
                    <option value="">
                      Not specified
                    </option>
                    <option value="MALE">
                      Male
                    </option>
                    <option value="FEMALE">
                      Female
                    </option>
                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </FormField>

                <FormField label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        email:
                          event.target.value,
                      }))
                    }
                    placeholder="user@example.com"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Mobile">
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        mobile:
                          event.target.value,
                      }))
                    }
                    placeholder="Mobile number"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Date of birth">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon
                        name="calendar"
                        size={16}
                      />
                    </span>

                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          dateOfBirth:
                            event.target.value,
                        }))
                      }
                      className="form-input pl-10"
                    />
                  </div>
                </FormField>

                <FormField label="Role">
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${roleClass(
                        selectedUser.role,
                      )}`}
                    >
                      {roleLabel(
                        selectedUser.role,
                      )}
                    </span>

                    <span className="ml-2 text-xs text-slate-400">
                      Managed separately
                    </span>
                  </div>
                </FormField>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                <strong>Note:</strong> Password,
                permissions and admin roles are not
                editable from the Users page.
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  Save changes
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      {confirmAction && (
        <ConfirmModal
          action={confirmAction.type}
          user={confirmAction.user}
          loading={actionLoading}
          onCancel={() => {
            if (!actionLoading) {
              setConfirmAction(null);
            }
          }}
          onConfirm={executeConfirmAction}
        />
      )}

      {/* =====================================================
          LOCAL STYLES
      ===================================================== */}

      <style jsx>{`
        .form-input {
          height: 44px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0 12px;
          font-size: 14px;
          color: rgb(30 41 59);
          outline: none;
          transition:
            border-color 150ms,
            background 150ms,
            box-shadow 150ms;
        }

        .form-input:focus {
          border-color: rgb(129 140 248);
          background: white;
          box-shadow: 0 0 0 4px rgb(99 102 241 / 0.1);
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   FILTER CHIP
========================================================= */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-[260px] items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-100">
      <span className="truncate">{label}</span>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-indigo-100"
      >
        <Icon name="x" size={10} />
      </button>
    </span>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  label,
  onClick,
  variant = "slate",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  variant?:
    | "slate"
    | "indigo"
    | "amber"
    | "green"
    | "red";
}) {
  const classes = {
    slate:
      "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700",
    indigo:
      "border-indigo-100 bg-indigo-50 text-indigo-600 hover:border-indigo-200 hover:bg-indigo-100",
    amber:
      "border-amber-100 bg-amber-50 text-amber-600 hover:border-amber-200 hover:bg-amber-100",
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-100",
    red:
      "border-rose-100 bg-rose-50 text-rose-600 hover:border-rose-200 hover:bg-rose-100",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${classes[variant]}`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   USER DETAILS
========================================================= */

function UserDetails({
  user,
  onClose,
  onEdit,
}: {
  user: AdminUser;
  onClose: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
            user.role === "SUPER_ADMIN"
              ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
              : user.role === "ADMIN"
                ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                : "bg-slate-200 text-slate-700"
          }`}
        >
          {getInitials(user)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900">
            {user.name || "Unnamed user"}
          </h3>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {user.email ||
              user.mobile ||
              "No contact information"}
          </p>
        </div>

        <div>
          {user.isDisabled ? (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200">
              Disabled
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              Active
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailItem
          icon="user"
          label="User ID"
          value={user.id}
        />

        <DetailItem
          icon="shield"
          label="Role"
          value={roleLabel(user.role)}
        />

        <DetailItem
          icon="mail"
          label="Email"
          value={user.email || "Not provided"}
        />

        <DetailItem
          icon="phone"
          label="Mobile"
          value={user.mobile || "Not provided"}
        />

        <DetailItem
          icon="calendar"
          label="Date of birth"
          value={
            formatDate(user.dateOfBirth) ||
            "Not provided"
          }
        />

        <DetailItem
          icon="user"
          label="Gender"
          value={user.gender || "Not specified"}
        />

        <DetailItem
          icon="calendar"
          label="Joined"
          value={formatDateTime(user.createdAt)}
        />

        <DetailItem
          icon="refresh"
          label="Last updated"
          value={formatDateTime(user.updatedAt)}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Icon name="edit" size={15} />
            Edit user
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon:
    | "user"
    | "shield"
    | "mail"
    | "phone"
    | "calendar"
    | "refresh";
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <Icon name={icon} size={12} />
        {label}
      </div>

      <p className="break-all text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   CONFIRM MODAL
========================================================= */

function ConfirmModal({
  action,
  user,
  loading,
  onCancel,
  onConfirm,
}: {
  action: "disable" | "enable" | "delete";
  user: AdminUser;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDelete = action === "delete";
  const isEnable = action === "enable";

  const title = isDelete
    ? "Delete user?"
    : isEnable
      ? "Enable user?"
      : "Disable user?";

  const description = isDelete
    ? `This will permanently delete ${
        user.name || "this user"
      } and their account. This action cannot be undone.`
    : isEnable
      ? `${
          user.name || "This user"
        } will be able to use their account again.`
      : `${
          user.name || "This user"
        } will no longer be able to use their account until it is enabled again.`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={() => {
          if (!loading) onCancel();
        }}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div
          className={`h-1.5 ${
            isDelete
              ? "bg-rose-500"
              : isEnable
                ? "bg-emerald-500"
                : "bg-amber-500"
          }`}
        />

        <div className="p-6">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
              isDelete
                ? "bg-rose-50 text-rose-600"
                : isEnable
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
            }`}
          >
            <Icon
              name={
                isDelete
                  ? "trash"
                  : isEnable
                    ? "unlock"
                    : "lock"
              }
              size={21}
            />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-xs font-bold text-slate-700">
                {getInitials(user)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {user.name || "Unnamed user"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user.email ||
                    user.mobile ||
                    user.id}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                isDelete
                  ? "bg-rose-600 hover:bg-rose-700"
                  : isEnable
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}

              {isDelete
                ? "Delete user"
                : isEnable
                  ? "Enable user"
                  : "Disable user"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING TABLE
========================================================= */

function LoadingTable() {
  return (
    <div className="animate-pulse">
      <div className="space-y-px">
        {Array.from({ length: 7 }).map(
          (_, index) => (
            <div
              key={index}
              className="flex min-w-[900px] items-center gap-5 border-b border-slate-100 px-5 py-5"
            >
              <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />

              <div className="w-[220px] space-y-2">
                <div className="h-3 w-32 rounded bg-slate-100" />
                <div className="h-2.5 w-20 rounded bg-slate-100" />
              </div>

              <div className="w-[230px] space-y-2">
                <div className="h-2.5 w-40 rounded bg-slate-100" />
                <div className="h-2.5 w-24 rounded bg-slate-100" />
              </div>

              <div className="h-6 w-20 rounded-full bg-slate-100" />

              <div className="h-6 w-16 rounded-full bg-slate-100" />

              <div className="h-8 w-24 rounded bg-slate-100" />

              <div className="ml-auto h-8 w-32 rounded bg-slate-100" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
        <Icon name="users" size={28} />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        No users found
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
        {hasFilters
          ? "No users match your current search and filters. Try adjusting them."
          : "There are no registered users to display yet."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}