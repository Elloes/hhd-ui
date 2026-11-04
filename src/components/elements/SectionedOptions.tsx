import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, MenuItem, MenuItemOption } from "@chakra-ui/react";
import { FC, Fragment, useState } from "react";
import { buildOptionGroups } from "./utils";

/**
 * MenuList content for option lists that carry "hhd.section:" groups
 * (e.g. the Konkr keyboard passthrough list from the daemon).
 *
 * Instead of one flat 80+-item list, each labeled group renders as a
 * single expandable row (accordion): the menu opens showing only the
 * section names; tapping a row reveals that section's (short) key list
 * inline, tapping the same row again collapses it, and tapping another
 * row switches sections. Picking a key fires `onPick` and closes the
 * menu (Chakra's default closeOnSelect on MenuItemOption).
 *
 * Unlabeled groups (plain option lists without section headers) still
 * render flat, as before.
 *
 * Chakra's Menu is lazy, so this component remounts on every open: the
 * section containing the currently selected value is expanded by
 * default (nothing is expanded when the value isn't in a labeled
 * group), so you always see the current mapping first.
 */
const SectionedOptions: FC<{
  options: Record<string, string>;
  selected?: string;
  onPick: (value: string) => void;
}> = ({ options, selected, onPick }) => {
  const groups = buildOptionGroups(options);
  const labeled = groups.filter((g) => g.label);
  const initial = labeled.findIndex((g) =>
    g.entries.some(([value]) => value === selected)
  );
  const [open, setOpen] = useState<number | null>(
    initial >= 0 ? initial : null
  );

  return (
    <>
      {groups.map((group, gi) => {
        if (!group.label) {
          // Plain (unlabeled) option group: render flat.
          return (
            <Fragment key={gi}>
              {group.entries.map(([value, label]) => (
                <MenuItemOption
                  key={value}
                  value={value}
                  onClick={() => onPick(value)}
                >
                  {label}
                </MenuItemOption>
              ))}
            </Fragment>
          );
        }
        const oi = labeled.indexOf(group);
        const isOpen = open === oi;
        return (
          <Fragment key={gi}>
            {/* Section row: toggles the section open/closed without
                closing the menu (closeOnSelect={false}). It registers
                as a normal menu item, so arrow keys, typeahead and
                outside-click handling all keep working. */}
            <MenuItem
              closeOnSelect={false}
              onClick={() => setOpen(isOpen ? null : oi)}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Box as="b">{group.label}</Box>
                <ChevronRightIcon
                  opacity={0.6}
                  transform={isOpen ? "rotate(90deg)" : "none"}
                  transition="transform 0.15s ease-in-out"
                />
              </Box>
            </MenuItem>
            {isOpen &&
              group.entries.map(([value, label]) => (
                <MenuItemOption
                  key={value}
                  value={value}
                  onClick={() => onPick(value)}
                >
                  {label}
                </MenuItemOption>
              ))}
          </Fragment>
        );
      })}
    </>
  );
};

export default SectionedOptions;
