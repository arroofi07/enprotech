import type { TablerIcon } from "@tabler/icons-react";
import {
  IconBook,
  IconCertificate,
  IconChartBar,
  IconClipboardCheck,
  IconClock,
  IconFolderOpen,
  IconLayoutDashboard,
  IconListCheck,
  IconMessage2,
  IconPencil,
  IconScale,
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
  isActive?: (pathname: string) => boolean;
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

function isStudentTrainingOverviewPath(pathname: string): boolean {
  return (
    pathname === "/student/trainings" ||
    /^\/student\/trainings\/[^/]+$/.test(pathname)
  );
}

function buildStudentLearningFlowNav(): DashboardNavItem[] {
  return [
    {
      title: "Pre Test",
      href: "/student/pre-test",
      icon: IconClipboardCheck,
      implemented: true,
      isActive: (pathname) =>
        pathname === "/student/pre-test" ||
        pathname.startsWith("/student/pre-test/") ||
        /^\/student\/trainings\/[^/]+\/pre-test(?:\/|$)/.test(pathname),
    },
    {
      title: "Modul",
      href: "/student/modules",
      icon: IconBook,
      implemented: true,
      isActive: (pathname) =>
        pathname === "/student/modules" ||
        pathname.startsWith("/student/modules/") ||
        /^\/student\/trainings\/[^/]+\/modules(?:\/|$)/.test(pathname),
    },
    {
      title: "Video Conference",
      href: "/student/video-conference",
      icon: IconVideo,
      implemented: true,
      activePrefixes: ["/student/video-conference"],
    },
    {
      title: "Quiz",
      href: "/student/quiz",
      icon: IconListCheck,
      implemented: true,
      isActive: (pathname) =>
        pathname === "/student/quiz" ||
        pathname.startsWith("/student/quiz/") ||
        /^\/student\/trainings\/[^/]+\/modules\/[^/]+\/quiz(?:\/|$)/.test(
          pathname,
        ),
    },
    {
      title: "Latihan",
      href: "/student/latihan",
      icon: IconPencil,
      implemented: true,
      isActive: (pathname) =>
        pathname === "/student/latihan" ||
        pathname.startsWith("/student/latihan/") ||
        /^\/student\/trainings\/[^/]+\/modules\/[^/]+\/latihan(?:\/|$)/.test(
          pathname,
        ),
    },
    {
      title: "Post Test",
      href: "/student/post-test",
      icon: IconClipboardCheck,
      implemented: true,
      isActive: (pathname) =>
        pathname === "/student/post-test" ||
        pathname.startsWith("/student/post-test/") ||
        /^\/student\/trainings\/[^/]+\/post-test(?:\/|$)/.test(pathname),
    },
    {
      title: "Project",
      href: "/student/projects",
      icon: IconFolderOpen,
      implemented: true,
      activePrefixes: ["/student/projects"],
    },
    {
      title: "Feedback",
      href: "/student/feedback",
      icon: IconMessage2,
      implemented: true,
      activePrefixes: ["/student/feedback"],
    },
    {
      title: "Nilai",
      href: "/student/nilai",
      icon: IconChartBar,
      implemented: true,
    },
    {
      title: "Sertifikat",
      href: "/student/certificates",
      icon: IconCertificate,
      implemented: true,
    },
  ];
}

function buildLearningFlowNav(prefix: LearningFlowPrefix): DashboardNavItem[] {
  if (prefix === "/student") {
    return buildStudentLearningFlowNav();
  }

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
      title: "Batas Waktu",
      href: `${prefix}/waktu-ujian`,
      icon: IconClock,
      implemented: true,
      isActive: (pathname) =>
        pathname === `${prefix}/waktu-ujian` ||
        pathname.startsWith(`${prefix}/waktu-ujian/`) ||
        new RegExp(`^${prefix}/trainings/[^/]+/waktu-ujian(?:/|$)`).test(
          pathname,
        ),
    },
    {
      title: "Bobot Soal",
      href: `${prefix}/bobot-soal`,
      icon: IconScale,
      implemented: true,
      isActive: (pathname) =>
        pathname === `${prefix}/bobot-soal` ||
        pathname.startsWith(`${prefix}/bobot-soal/`) ||
        new RegExp(`^${prefix}/trainings/[^/]+/bobot-soal(?:/|$)`).test(pathname),
    },
    {
      title: "Project",
      href: `${prefix}/projects`,
      icon: IconFolderOpen,
      implemented: true,
      activePrefixes: [`${prefix}/projects`],
    },
    {
      title: "Feedback",
      href: `${prefix}/feedback`,
      icon: IconMessage2,
      implemented: true,
      activePrefixes: [`${prefix}/feedback`],
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
      implemented: true,
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
    label: "Administrasi",
    items: [
      {
        title: "Dashboard",
        href: "/student/dashboard",
        icon: IconLayoutDashboard,
        implemented: true,
      },
      {
        title: "Training Saya",
        href: "/student/trainings",
        icon: IconSchool,
        implemented: true,
        isActive: isStudentTrainingOverviewPath,
      },
    ],
  },
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
    homeHref: "/student/dashboard",
    shellLabel: "E-Training Student",
    groups: STUDENT_NAV,
  };
}

export function isNavItemActive(
  pathname: string,
  item: Pick<DashboardNavItem, "href" | "activePrefixes" | "isActive">,
): boolean {
  if (item.isActive) {
    return item.isActive(pathname);
  }

  const prefixes = item.activePrefixes ?? [item.href];

  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
