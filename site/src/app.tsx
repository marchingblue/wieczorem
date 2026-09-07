import { useEffect, useState } from "react";
import {
  Button,
  ToggleButton,
  Switch,
  Segmented,
  ConfirmDialog,
  Modal,
  ButtonGroup,
  Breadcrumbs,
  Dropdown,
  Select,
  MultiSelect,
  Input,
  ContextMenu,
  CommandMenu,
  CopyButton,
  Checkbox,
  Radio,
  RadioGroup,
  Otp,
  Combobox,
  ComboboxMulti,
  Slider,
  Badge,
  ProgressBar,
  Spinner,
  Skeleton,
  Dropzone,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarTrigger,
  SidebarWorkspace,
  CopyIcon,
  Heatmap,
  Drawer,
  Tooltip,
  Callout,
  Collapsible,
  SmartPagination,
  Tree,
  DateInput,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@wieczorem/react";
import {
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "./icons.js";
function Section({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sec">
      <div className="sec-label">{label}</div>
      <div className="sec-body">{children}</div>
      {note ? <div className="sec-note">{note}</div> : null}
    </section>
  );
}

/** a labeled row: name on the left, control on the right */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      {children}
    </div>
  );
}

const genreOptions = [
  { value: "ambient" },
  { value: "drone" },
  { value: "field recordings" },
  { value: "modern classical" },
  { value: "jazz" },
  { value: "shoegaze" },
  { value: "synthwave" },
];

const zoneOptions = [
  { value: "eastern", group: "americas" },
  { value: "pacific", group: "americas" },
  { value: "gmt", group: "europe" },
  { value: "cet", group: "europe" },
  { value: "jst", group: "asia/pacific" },
  { value: "aest", group: "asia/pacific" },
];

const heatmapCells = Array.from({ length: 7 * 20 }, (_, i) => ({
  level: [0, 0, 1, 2, 0, 3, 4, 1, 0, 2][
    (i * 7 + Math.floor(i / 7)) % 10
  ] as number,
  title: `day ${i + 1}`,
}));

export default function App() {
  const [dark, setDark] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [drawerSide, setDrawerSide] = useState<
    "left" | "right" | "top" | "bottom"
  >("right");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBlur, setDrawerBlur] = useState(false);
  const [drawerHandle, setDrawerHandle] = useState(true);
  const [view, setView] = useState("editor");
  const [checked, setChecked] = useState(true);
  const [code, setCode] = useState("");
  const [flavor, setFlavor] = useState("");
  const [stack, setStack] = useState<string[]>(["paper"]);
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState<string[]>([
    "field recordings",
    "modern classical",
  ]);
  const [vol, setVol] = useState(40);
  const [range, setRange] = useState<[number, number]>([25, 75]);
  const [progress, setProgress] = useState(64);
  const [page, setPage] = useState(3);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="wordmark">
          wieczorem <span>— calm components</span>
        </div>
        <div className="masthead-right">
          <span className="ver">0.2.0</span>
          <ToggleButton pressed={dark} onPressedChange={setDark} size="sm">
            {dark ? "dark" : "light"}
          </ToggleButton>
        </div>
      </header>

      <main>
        <Section
          label="button — variants"
          note="outline is the quiet default. danger is the one loud voice: solid, because it reads as final."
        >
          <Button>outline</Button>
          <Button variant="primary">primary</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="danger" onClick={() => setDangerOpen(true)}>
            delete
          </Button>
          <Button disabled>disabled</Button>
        </Section>

        <Section label="button — sizes & shapes">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
          <Button shape="pill" variant="primary">pill</Button>
          <Button shape="icon" aria-label="edit">
            <PencilIcon />
          </Button>
          <Button shape="icon" variant="danger" aria-label="delete">
            <TrashIcon />
          </Button>
        </Section>

        <Section
          label="toggle button"
          note="the on-state stays sunken, like a latched key. latches have no hover — the fill is the state. icon buttons keep equal padding."
        >
          <ToggleButton>grid</ToggleButton>
          <ToggleButton defaultPressed>snap</ToggleButton>
          <ToggleButton shape="icon" aria-label="copy">
            <CopyIcon size={13} />
          </ToggleButton>
          <ToggleButton shape="icon" defaultPressed aria-label="search">
            <SearchIcon size={13} />
          </ToggleButton>
        </Section>

        <Section
          label="switch"
          note="a latch, smaller now: outer barely rounded, knob rounder than its housing. press nudges, release springs."
        >
          <Row label="notifications">
            <Switch aria-label="notifications" />
          </Row>
          <Row label="business days only">
            <Switch defaultChecked aria-label="business days only" />
          </Row>
          <Row label="auto-save">
            <Switch disabled aria-label="auto-save" />
          </Row>
        </Section>

        <Section
          label="segmented"
          note="one quiet rail, one highlight gliding between options."
        >
          <Segmented
            aria-label="view"
            value={view}
            onChange={setView}
            options={[
              { value: "editor", label: "editor" },
              { value: "recipients", label: "recipients" },
            ]}
          />
          <Segmented
            aria-label="density"
            defaultValue="cozy"
            options={[
              { value: "compact", label: "compact" },
              { value: "cozy", label: "cozy" },
              { value: "roomy", label: "roomy" },
            ]}
          />
        </Section>

        <Section label="button group">
          <ButtonGroup>
            <Button size="sm">day</Button>
            <Button size="sm">week</Button>
            <Button size="sm">month</Button>
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <Button size="sm">up</Button>
            <Button size="sm">down</Button>
          </ButtonGroup>
        </Section>

        <Section label="breadcrumbs">
          <Breadcrumbs
            items={[
              { label: "home", href: "#" },
              { label: "projects", href: "#" },
              { label: "mut", href: "#" },
            ]}
          />
          <Breadcrumbs
            separator="→"
            maxItems={4}
            items={[
              { label: "home", href: "#" },
              { label: "library", href: "#" },
              { label: "react", href: "#" },
              { label: "src", href: "#" },
              { label: "button.tsx" },
            ]}
          />
        </Section>

        <Section
          label="dropdown"
          note="chevron={false} for a plain trigger that still summons the menu."
        >
          <Dropdown
            trigger="actions"
            label="actions"
            items={[
              { label: "duplicate", onSelect: () => console.log("duplicate") },
              { label: "archive", onSelect: () => console.log("archive") },
              { label: "delete", danger: true, onSelect: () => console.log("delete") },
            ]}
          />
          <Dropdown
            trigger="bare"
            chevron={false}
            variant="ghost"
            items={[
              { label: "one" },
              { label: "two" },
            ]}
          />
          <Dropdown
            trigger="settings"
            align="right"
            variant="ghost"
            items={[
              { label: "keyboard shortcuts" },
              { label: "theme", disabled: true },
              { label: "log out" },
            ]}
          />
        </Section>

        <Section label="select" note="single closes on pick; multi keeps the list open and grows chips.">
          <Select
            aria-label="flavor"
            value={flavor}
            onChange={setFlavor}
            placeholder="pick a flavor…"
            options={[
              { value: "paper" },
              { value: "gravel" },
              { value: "fog" },
              { value: "ink" },
            ]}
          />
          <Select
            aria-label="cadence"
            defaultValue="weekly"
            align="right"
            variant="ghost"
            options={[
              { value: "daily" },
              { value: "weekly" },
              { value: "monthly" },
            ]}
          />
          <MultiSelect
            aria-label="flavors"
            value={stack}
            onChange={setStack}
            placeholder="pick flavors…"
            options={[
              { value: "paper" },
              { value: "gravel" },
              { value: "fog" },
              { value: "ink" },
            ]}
          />
        </Section>

        <Section label="input" note="label, hint, and error stack in the field; addons glue inside the frame.">
          <div className="col">
            <Input
              label="callsign"
              placeholder="night-owl"
              description="lowercase, no spaces — heard once, remembered."
            />
            <Input
              label="frequency"
              placeholder="0.00"
              suffix="mhz"
              size="sm"
            />
            <Input
              label="password"
              type="password"
              defaultValue="hunter2hunter2"
              error="too short — 12 characters minimum."
            />
            <Input label="locked" defaultValue="read me, don't touch me" disabled />
            <DateInput label="launch day" defaultValue="2026-09-07" />
          </div>
        </Section>

        <Section
          label="context menu"
          note="right-click the zone — only inside it. the rest of the page keeps the browser's menu."
        >
          <ContextMenu
            label="zone actions"
            items={[
              { label: "duplicate", onSelect: () => console.log("dup") },
              { label: "rename", onSelect: () => console.log("ren") },
              { label: "delete", danger: true, onSelect: () => console.log("del") },
            ]}
          >
            <div className="ctx-zone">right-click me</div>
          </ContextMenu>
        </Section>

        <Section
          label="command menu"
          note="press ⌘K / ctrl+K. icons on rows, keybind hints on the right."
        >
          <Button onClick={() => setCmdOpen(true)} variant="primary">
            open palette
          </Button>
          <kbd className="kbd-hint">⌘K</kbd>
        </Section>

        <Section label="copy to clipboard">
          <CopyButton value="pnpm add @wieczorem/react" aria-label="copy install command" />
          <span className="inline-code">pnpm add @wieczorem/react</span>
          <CopyButton value="wieczorem" aria-label="copy name" />
        </Section>

        <Section label="checkbox" note="no check mark — the box fills and answers with a small dot.">
          <Checkbox
            label="include prereleases"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <Checkbox label="indeterminate" indeterminate />
          <Checkbox label="locked" disabled />
        </Section>

        <Section label="radio" note="one dot in a circle; the dot pops in. rows, stacks, or choice cards.">
          <RadioGroup
            aria-label="tempo"
            defaultValue="slow"
            items={[
              { value: "slow", label: "slow" },
              { value: "medium", label: "medium" },
              { value: "fast", label: "fast" },
              { value: "broken", label: "broken", disabled: true },
            ]}
          />
          <Radio name="solo" label="solo radio" />
          <RadioGroup
            aria-label="seat"
            orientation="vertical"
            defaultValue="window"
            items={[
              { value: "window", label: "window", description: "watch the night pass" },
              { value: "aisle", label: "aisle", description: "stretch your legs" },
            ]}
          />
          <RadioGroup
            aria-label="plan"
            variant="card"
            defaultValue="night"
            items={[
              { value: "day", label: "day", description: "bright and loud" },
              { value: "night", label: "night", description: "quiet and calm" },
            ]}
          />
        </Section>

        <Section label="otp" note="joined cells — one shape, like a button group.">
          <Otp
            value={code}
            onChange={setCode}
            onComplete={(v) => console.log("complete:", v)}
            aria-label="verification code"
          />
          <Otp length={4} size="sm" defaultValue="12" aria-label="short code" />
        </Section>

        <Section
          label="combobox"
          note="the pick becomes the titlebar; the list closes. multi grows reorderable chips — drag them."
        >
          <Combobox
            aria-label="genre"
            value={genre}
            onChange={setGenre}
            placeholder="pick a genre…"
            chevron
            showClear
            options={genreOptions}
          />
          <ComboboxMulti
            aria-label="genres"
            value={genres}
            onChange={setGenres}
            placeholder="add genres…"
            chevron
            options={genreOptions}
          />
          <Combobox
            aria-label="timezone"
            placeholder="pick a timezone…"
            chevron
            options={zoneOptions}
          />
        </Section>

        <Section
          label="slider"
          note="a bright square with a dark mark. arrows step, page keys jump by ten, drag anywhere on the rail."
        >
          <div className="col">
            <Row label={`volume — ${vol}`}>
              <Slider
                value={vol}
                onChange={(v) => setVol(v as number)}
                aria-label="volume"
              />
            </Row>
            <Row label={`range — ${range[0]}…${range[1]}`}>
              <Slider
                value={range}
                onChange={(v) => setRange(v as [number, number])}
                aria-label="price range"
              />
            </Row>
            <Row label="fine (0–1, step 0.1)">
              <Slider
                min={0}
                max={1}
                step={0.1}
                defaultValue={0.3}
                ruler
                aria-label="blend"
              />
            </Row>
          </div>
        </Section>

        <Section label="badge" note="tones only when they carry meaning.">
          <Badge>default</Badge>
          <Badge dot>with dot</Badge>
          <Badge tone="contrast">contrast</Badge>
          <Badge tone="success" dot>stable</Badge>
          <Badge tone="warning" dot>drifting</Badge>
          <Badge tone="danger" dot>failed</Badge>
          <Badge look="outline">outline</Badge>
        </Section>

        <Section label="progress" note="pass no value and a bar patrols. a label earns the titlebar row.">
          <div className="col">
            <Row label={`loading — ${progress}%`}>
              <ProgressBar value={progress} aria-label="progress" />
            </Row>
            <ProgressBar value={progress} label="upload progress" />
            <div className="row">
              <span className="row-label">set</span>
              <ButtonGroup>
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 20))}>−</Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 20))}>+</Button>
              </ButtonGroup>
            </div>
            <Row label="indeterminate">
              <ProgressBar aria-label="working" />
            </Row>
          </div>
        </Section>

        <Section label="spinner">
          <Spinner size="sm" aria-label="loading small" />
          <Spinner aria-label="loading" />
          <Spinner size="lg" aria-label="loading large" />
        </Section>

        <Section label="skeleton">
          <div className="col skel-demo">
            <div className="skel-row">
              <Skeleton shape="circle" height={28} />
              <div className="skel-lines">
                <Skeleton width="40%" />
                <Skeleton width="72%" size="sm" />
              </div>
            </div>
            <Skeleton shape="rect" height={64} width="100%" />
            <Skeleton width="56%" />
          </div>
        </Section>

        <Section
          label="dropzone"
          note="dashed | solid. a corner trace while you hover files over it, a drawn check when they land."
        >
          <div className="col">
            <Dropzone
              hint="any file, any size — it's a demo"
              onFiles={(files) => console.log("dropped:", files)}
            />
            <Dropzone style="solid" label="solid flavor" />
          </div>
        </Section>

        <Section
          label="sidebar"
          note="composable: the provider owns the state, parts compose inside. ctrl+b toggles, collapses to an icon rail."
        >
          <SidebarProvider width={240}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Sidebar>
                <SidebarHeader>
                  <SidebarWorkspace name="acme" onSelect={() => console.log("workspace")} />
                </SidebarHeader>
                <SidebarContent>
                  <SidebarGroup label="workspace">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton label="overview" isActive />
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton label="deployments" badge={<Badge>3</Badge>} />
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton label="domains" />
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                  <SidebarGroup
                    label="account"
                    action={
                      <SidebarMenuAction label="add account">
                        <PencilIcon size={12} />
                      </SidebarMenuAction>
                    }
                  >
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton label="billing" />
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton label="keys" />
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton label="danger zone" disabled />
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>wieczorem — calm components</SidebarFooter>
              </Sidebar>
              <SidebarTrigger />
            </div>
          </SidebarProvider>
        </Section>
        <Section label="heatmap" note="github-style, all greyscale.">
          <Heatmap cells={heatmapCells} legend />
        </Section>

        <Section label="tooltip" note="hover waits a beat, keyboard shows at once, escape dismisses.">
          <Tooltip content="copies the install line">
            <Button shape="icon" aria-label="copy install line">
              <CopyIcon size={13} />
            </Button>
          </Tooltip>
          <Tooltip content="deletes the draft" side="bottom">
            <Button shape="icon" variant="danger" aria-label="delete draft">
              <TrashIcon />
            </Button>
          </Tooltip>
        </Section>

        <Section label="callout" note="ink by default; a tone only when the meaning needs the eye.">
          <div className="col" style={{ gap: 8 }}>
            <Callout title="nightly built">
              the quiet build finished while you were away. nothing to do.
            </Callout>
            <Callout title="disk almost full" tone="warning">
              two releases left at this size. archive something soon.
            </Callout>
            <Callout title="deploy failed" tone="danger">
              the last push never landed. the previous build still serves.
            </Callout>
          </div>
        </Section>

        <Section label="collapsible" note="the panel unfolds with the grid glide — no measuring, no jump.">
          <div className="col" style={{ gap: 8 }}>
            <Collapsible trigger="release notes" defaultOpen>
              <p className="sec-note">quieter rails, softer switches, a sidebar that minds its business.</p>
            </Collapsible>
            <Collapsible trigger="keyboard shortcuts">
              <p className="sec-note">ctrl+b toggles the sidebar, ⌘K opens the palette, escape closes everything.</p>
            </Collapsible>
          </div>
        </Section>

        <Section label="tree" note="right expands, left collapses, enter picks.">
          <Tree
            aria-label="files"
            defaultExpanded={["src"]}
            defaultSelected="app"
            items={[
              {
                value: "src",
                label: "src",
                children: [
                  { value: "app", label: "app.tsx" },
                  { value: "grid", label: "grid.css" },
                ],
              },
              { value: "readme", label: "readme.md" },
            ]}
          />
        </Section>

        <Section label="table" note="hairlines, hover wash, sunken picks. compose freely.">
          <Table>
            <THead>
              <TR>
                <TH>release</TH>
                <TH>landed</TH>
                <TH numeric>tracks</TH>
              </TR>
            </THead>
            <TBody>
              <TR selected>
                <TD>night-12</TD>
                <TD>today</TD>
                <TD numeric>9</TD>
              </TR>
              <TR>
                <TD>night-11</TD>
                <TD>yesterday</TD>
                <TD numeric>7</TD>
              </TR>
              <TR>
                <TD>night-10</TD>
                <TD>last week</TD>
                <TD numeric>11</TD>
              </TR>
            </TBody>
          </Table>
        </Section>

        <Section label="pagination" note="the current page stays sunken, gaps become an ellipsis.">
          <SmartPagination total={12} value={page} onChange={setPage} aria-label="releases" />
        </Section>

        <Section
          label="drawer"
          note="any edge — left, right, top, bottom — with mirrored open/close animation. optional handle bar and frosted overlay."
        >
          <div className="drawer-controls">
            <Segmented
              aria-label="drawer side"
              value={drawerSide}
              onChange={(s) => setDrawerSide(s as typeof drawerSide)}
              options={[
                { value: "left", label: "left" },
                { value: "right", label: "right" },
                { value: "top", label: "top" },
                { value: "bottom", label: "bottom" },
              ]}
            />
            <Switch
              checked={drawerHandle}
              onCheckedChange={setDrawerHandle}
              aria-label="drawer handle"
            />
            <span className="row-label">handle</span>
            <Switch
              checked={drawerBlur}
              onCheckedChange={setDrawerBlur}
              aria-label="drawer blur"
            />
            <span className="row-label">blur</span>
            <Button
              onClick={() => setDrawerOpen(true)}
            >
              open {drawerSide} drawer
            </Button>
          </div>
        </Section>

        <Section label="modal" note="the general interruption — rises in, falls out.">
          <Button onClick={() => setModalOpen(true)}>open modal</Button>
        </Section>

        <div className="hint">
          every visual decision is a css custom property. rebrand without
          touching the components:
          <code>{`:root {\n  --mut-ink: #3a5a40;\n  --mut-r-sm: 3px;\n}`}</code>
        </div>
      </main>

      <ConfirmDialog
        open={dangerOpen}
        tone="danger"
        title="delete everything?"
        confirmLabel="delete"
        onConfirm={() => console.log("deleted (not really)")}
      >
        this action cannot be undone. the quiet ones are always the most
        destructive — that's why this one gets to be loud.
      </ConfirmDialog>

      <Modal
        open={modalOpen}
        title="a quiet interruption"
        onOpenChange={setModalOpen}
        blur
      >
        <p className="mut-dialog__body">
          the modal rises in and falls out the same way. compose your own
          actions inside.
        </p>
        <div className="mut-dialog__actions">
          <Button onClick={() => setModalOpen(false)}>close</Button>
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            got it
          </Button>
        </div>
      </Modal>

      <CommandMenu
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        items={[
          { value: "new file", label: "new file", group: "actions", keys: ["⌘", "N"], icon: <PencilIcon size={13} />, onSelect: () => console.log("new file") },
          { value: "copy install command", label: "copy install command", group: "actions", icon: <CopyIcon size={13} />, onSelect: () => navigator.clipboard?.writeText("pnpm add @wieczorem/react") },
          { value: "delete workspace", label: "delete workspace", group: "actions", icon: <TrashIcon size={13} />, onSelect: () => console.log("delete") },
          { value: "toggle theme", label: "toggle theme", group: "preferences", keys: ["⌘", "L"], onSelect: () => setDark((d) => !d) },
          { value: "search docs", label: "search docs", group: "navigate", keys: ["/"], icon: <SearchIcon size={13} />, onSelect: () => console.log("docs") },
          { value: "open github", label: "open github", group: "navigate", onSelect: () => window.open("https://github.com", "_blank") },
        ]}
      />

      <Drawer
        open={drawerOpen}
        side={drawerSide}
        handle={drawerHandle}
        blur={drawerBlur}
        title={`${drawerSide} drawer`}
        onOpenChange={setDrawerOpen}
      >
        <p>it slides in, it waits, it leaves the same way. nothing behind it moves.</p>
        <Row label="notifications">
          <Switch defaultChecked aria-label="drawer notifications" />
        </Row>
        <Row label="auto-save">
          <Switch aria-label="drawer auto-save" />
        </Row>
        <div className="drawer-actions">
          <Button size="sm" onClick={() => setDrawerOpen(false)}>close</Button>
        </div>
      </Drawer>
    </div>
  );
}
