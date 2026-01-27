export interface Task {
  id: string
  title: string
  status: "todo" | "in-progress" | "done" | "cancelled"
  priority: "low" | "medium" | "high"
  label: "bug" | "feature" | "documentation"
  createdAt: string
}

export const statuses = [
  {
    value: "todo",
    label: "Todo",
  },
  {
    value: "in-progress",
    label: "In Progress",
  },
  {
    value: "done",
    label: "Done",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
]

export const priorities = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
]

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const tasks: Task[] = [
  {
    id: "TASK-8782",
    title: "You can't compress the program without quantifying the open-source SSD pixel!",
    status: "in-progress",
    priority: "medium",
    label: "documentation",
    createdAt: "2024-01-15",
  },
  {
    id: "TASK-7878",
    title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    status: "todo",
    priority: "high",
    label: "feature",
    createdAt: "2024-01-14",
  },
  {
    id: "TASK-7839",
    title: "We need to bypass the neural TCP card!",
    status: "done",
    priority: "low",
    label: "bug",
    createdAt: "2024-01-13",
  },
  {
    id: "TASK-5562",
    title: "The SAS interface is down, bypass the open-source sensor so we can get the SAS bandwidth!",
    status: "todo",
    priority: "medium",
    label: "feature",
    createdAt: "2024-01-12",
  },
  {
    id: "TASK-8686",
    title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
    status: "cancelled",
    priority: "medium",
    label: "documentation",
    createdAt: "2024-01-11",
  },
  {
    id: "TASK-1280",
    title: "Use the digital TLS panel, then you can transmit the haptic system!",
    status: "done",
    priority: "high",
    label: "bug",
    createdAt: "2024-01-10",
  },
  {
    id: "TASK-7262",
    title: "The UTF8 application is down, parse the neural bandwidth so we can get the UTF8 matrix!",
    status: "in-progress",
    priority: "low",
    label: "feature",
    createdAt: "2024-01-09",
  },
  {
    id: "TASK-1138",
    title: "Generating the driver won't do anything, we need to quantify the 1080p SMTP bandwidth!",
    status: "todo",
    priority: "high",
    label: "bug",
    createdAt: "2024-01-08",
  },
  {
    id: "TASK-7184",
    title: "We need to program the back-end THX pixel!",
    status: "done",
    priority: "medium",
    label: "documentation",
    createdAt: "2024-01-07",
  },
  {
    id: "TASK-5160",
    title: "Calculating the bus won't do anything, we need to navigate the back-end JSON protocol!",
    status: "in-progress",
    priority: "low",
    label: "feature",
    createdAt: "2024-01-06",
  },
  {
    id: "TASK-5618",
    title: "I'll compress the virtual JSON pixel, that should card the JBOD transmitter!",
    status: "todo",
    priority: "high",
    label: "bug",
    createdAt: "2024-01-05",
  },
  {
    id: "TASK-6699",
    title: "Parsing the firewall won't do anything, we need to program the primary RAM bus!",
    status: "cancelled",
    priority: "low",
    label: "documentation",
    createdAt: "2024-01-04",
  },
  {
    id: "TASK-2858",
    title: "We need to hack the multi-byte CSS interface!",
    status: "done",
    priority: "medium",
    label: "feature",
    createdAt: "2024-01-03",
  },
  {
    id: "TASK-9864",
    title: "Try to override the ASCII protocol, maybe it will parse the virtual matrix!",
    status: "in-progress",
    priority: "high",
    label: "bug",
    createdAt: "2024-01-02",
  },
  {
    id: "TASK-8404",
    title: "The IP bandwidth is down, synthesize the neural hard drive so we can get the IP capacitor!",
    status: "todo",
    priority: "low",
    label: "documentation",
    createdAt: "2024-01-01",
  },
]
