import type { TablerIcon } from "@tabler/icons-react";
import {
  IconBook,
  IconCertificate,
  IconChartBar,
  IconClipboardCheck,
  IconLayoutDashboard,
  IconListCheck,
  IconPencil,
  IconSchool,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";

import type { SessionUser } from "@/lib/domain/auth/types";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: TablerIcon;
  implemented: boolean;
  activePrefixes?: string[];
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export type DashboardNavConfig = {
  homeHref: string;
  shellLabel: string;
  groups: DashboardNavGroup[];
};

type LearningFlowPrefix = "/student" | "/trainer";

function buildLearningFlowNav(prefix: LearningFlowPrefix): DashboardNavItem[] {
  return [
    {
      title: "Pre Test",
      href: `${prefix}/pre-test`,
      icon: IconClipboardCheck,
      implemented: true,
      activePrefixes: [
        `${prefix}/pre-test`,
        `${prefix}/trainings`,
      ],
    },
    {
      title: "Modul",
      href: `${prefix}/modules`,
      icon: IconBook,
      implemented: true,
      activePrefixes: [`${prefix}/modules`, `${prefix}/trainings`],
    },
    {
      title: "Video Conference",
      href: `${prefix}/video-conference`,
      icon: IconVideo,
      implemented: true,
      activePrefixes: [`${prefix}/video-conference`],
    },
    {
      title: "Quiz",
      href: `${prefix}/quiz`,
      icon: IconListCheck,
      implemented: true,
      activePrefixes: [`${prefix}/quiz`, `${prefix}/trainings`],
    },
    {
      title: "Latihan",
      href: `${prefix}/latihan`,
      icon: IconPencil,
      implemented: true,
      activePrefixes: [`${prefix}/latihan`, `${prefix}/trainings`],
    },
    {
      title: "Post Test",
      href: `${prefix}/post-test`,
      icon: IconClipboardCheck,
      implemented: true,
      activePrefixes: [
        `${prefix}/post-test`,
        `${prefix}/trainings`,
      ],
    },
    {
      title: "Nilai",
      href: `${prefix}/nilai`,
      icon: IconChartBar,
      implemented: true,
    },
    {
      title: "Sertifikat",
      href: `${prefix}/certificates`,
      icon: IconCertificate,
      implemented: prefix === "/student",
    },
  ];
}

const CREATE_TRAINING_NAV_ITEM: DashboardNavItem = {
  title: "Buat Training",
  href: "/trainer/trainings/new",
  icon: IconSchool,
  implemented: true,
  activePrefixes: ["/trainer/trainings/new"],
};

const ADMIN_NAV: DashboardNavGroup[] = [
  {
    label: "Administrasi",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: IconLayoutDashboard,
        implemented: true,
      },
      {
        title: "Pengguna",
        href: "/admin/users",
        icon: IconUsers,
        implemented: true,
      },
      CREATE_TRAINING_NAV_ITEM,
    ],
  },
  {
    label: "Alur E-Training",
    items: buildLearningFlowNav("/trainer"),
  },
];

const TRAINER_NAV: DashboardNavGroup[] = [
  {
    label: "Administrasi",
    items: [
      {
        title: "Dashboard",
        href: "/trainer/dashboard",
        icon: IconLayoutDashboard,
        implemented: true,
      },
      CREATE_TRAINING_NAV_ITEM,
    ],
  },
  {
    label: "Alur E-Training",
    items: buildLearningFlowNav("/trainer"),
  },
];

const STUDENT_NAV: DashboardNavGroup[] = [
  {
    label: "Alur E-Training",
    items: buildLearningFlowNav("/student"),
  },
];

export function getDashboardNav(user: SessionUser): DashboardNavConfig {
  if (user.role === "admin") {
    return {
      homeHref: "/admin/dashboard",
      shellLabel: "E-Training Admin",
      groups: ADMIN_NAV,
    };
  }

  if (user.role === "trainer") {
    return {
      homeHref: "/trainer/dashboard",
      shellLabel: "E-Training Trainer",
      groups: TRAINER_NAV,
    };
  }

  return {
    homeHref: "/student/modules",
    shellLabel: "E-Training Student",
    groups: STUDENT_NAV,
  };
}

export function isNavItemActive(
  pathname: string,
  item: Pick<DashboardNavItem, "href" | "activePrefixes">,
): boolean {
  const prefixes = item.activePrefixes ?? [item.href];

  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
