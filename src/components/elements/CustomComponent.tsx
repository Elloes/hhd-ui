import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Flex,
  FormLabel,
  Menu,
  MenuButton,
  MenuList,
  Progress,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { FC } from "react";
import { CustomSetting, ProgressProps, SettingProps } from "../../model/common";
import { useElementNav, useSettingState } from "../../model/hooks";
import {
  buildOptionGroups,
  getButtonStyleNested,
  getFocusStyle,
} from "./utils";
import SectionedOptions from "./SectionedOptions";

const ProgressComponent: FC<SettingProps> = ({ path, settings }) => {
  const { tags } = settings;
  const { state } = useSettingState<ProgressProps | undefined>(path);
  let props = {};
  if (!state) {
    return <></>;
  } else if (state.value === undefined || state.value === null) {
    props = { isIndeterminate: true, value: 0 };
  } else {
    const max = state.max ?? 100;
    const value = state.value;
    const percent = (value / max) * 100;

    props = {
      value: percent,
    };
  }
  const slim = tags?.includes("slim");

  return (
    <Box margin="0.5rem 0.7rem">
      {!slim && (state.text || state.unit) && (
        <Center>
          <Text fontSize="sm" marginBottom="0.5rem" marginTop="0.7rem">
            {state.text}
            {state.unit}
          </Text>
        </Center>
      )}
      <Flex marginBottom="0.8rem">
        <Progress
          {...props}
          borderRadius="4px"
          flexDirection="row"
          width="100%"
        />
        {slim && (state.text || state.unit) && (
          <Text fontSize="sm" marginLeft="0.5rem" marginTop="-0.22rem">
            {state.text}
            {state.unit}
          </Text>
        )}
      </Flex>
    </Box>
  );
};

const DropdownComponent: FC<SettingProps> = ({
  settings: set,
  path,
  section,
}) => {
  const { title } = set as CustomSetting<undefined, undefined>;
  const { state, setState } = useSettingState<
    { options: Record<string, string>; value: string } | undefined
  >(path);
  const { ref, focus, setFocus } = useElementNav<HTMLButtonElement>(
    section,
    path
  );
  const { colorMode } = useColorMode();

  const { state: hsv } = useSettingState<{
    hue: number;
    saturation: number;
    brightness: number;
  }>(path.substring(0, path.lastIndexOf(".")));

  if (!state) {
    return <></>;
  }

  const { options, value: svalue } = state;
  // "hhd.section:…" keys in a dynamic option list are UI-only section headers
  // (see the daemon's Konkr key options): SectionedOptions turns labeled
  // groups into expandable per-section rows so they are never submitted as
  // values, while plain (unlabeled) lists render flat as before.
  const groups = buildOptionGroups(options);
  // Cap long menus so they scroll internally instead of overflowing the
  // screen (same as MultipleComponent); without overflowY the capped list
  // would be clipped and the wheel would still scroll the page.
  const longList = groups.reduce((n, g) => n + g.entries.length, 0) > 12;

  return (
    <Flex
      flexDirection="column"
      {...getFocusStyle(focus, colorMode)}
      margin="0.2rem 0"
    >
      <FormLabel htmlFor={path}>{title}</FormLabel>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          ref={ref}
          onFocus={setFocus}
          marginBottom="0.35rem"
          {...getButtonStyleNested(set.tags, hsv)}
        >
          {svalue && options[svalue]}
        </MenuButton>
        <MenuList
          zIndex={100}
          {...(longList && { maxHeight: "55vh", overflowY: "auto" })}
        >
          <SectionedOptions
            options={options}
            selected={svalue}
            onPick={(value) =>
              setState({ options: state.options, value })
            }
          />
        </MenuList>
      </Menu>
    </Flex>
  );
};

const CustomComponent: FC<SettingProps> = ({
  settings: set,
  path,
  section,
}) => {
  const { tags } = set;

  if (tags?.includes("progress")) {
    return <ProgressComponent settings={set} path={path} section={section} />;
  }

  if (tags?.includes("dropdown")) {
    return <DropdownComponent settings={set} path={path} section={section} />;
  }
  return <> </>;
};

export default CustomComponent;
