import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Clock, EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { AllocationView } from "@/lib/allocations";
import { groupBy } from "@/lib/collections";
import { courseColor } from "@/lib/colors";
import { DAY_LABELS } from "@/lib/days";
import { pluralize } from "@/lib/text";
import { durationInMinutes, formatDuration, formatHour } from "@/lib/time";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/entities";
import { RouterLink } from "./links";

const DAYS_WITHOUT_SUNDAY = DAYS_OF_WEEK.filter((day) => day !== "SUNDAY");

type WeekScheduleProps = {
  allocations: AllocationView[];
  /** Dias exibidos; por padrão segunda a sábado (domingo só se houver aula). */
  days?: readonly DayOfWeek[];
  showProfessor?: boolean;
  onCreate?: (day: DayOfWeek) => void;
  onEdit?: (allocation: AllocationView) => void;
  onDelete?: (allocation: AllocationView) => void;
};

/** Grade semanal: uma coluna por dia com as aulas em ordem de horário. */
export function WeekSchedule({
  allocations,
  days,
  showProfessor = true,
  onCreate,
  onEdit,
  onDelete,
}: WeekScheduleProps) {
  const visibleDays =
    days ??
    (allocations.some((allocation) => allocation.dayOfWeek === "SUNDAY")
      ? DAYS_OF_WEEK
      : DAYS_WITHOUT_SUNDAY);
  const allocationsByDay = groupBy(
    allocations,
    (allocation) => allocation.dayOfWeek,
  );

  return (
    <SimpleGrid
      columns={{ base: 1, sm: 2, lg: 3, xl: Math.min(visibleDays.length, 7) }}
      spacing="4"
    >
      {visibleDays.map((day) => {
        const items = allocationsByDay.get(day) ?? [];

        return (
          <Box
            key={day}
            as="section"
            aria-label={DAY_LABELS[day].long}
            p="3"
            minH="44"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.subtle"
            rounded="xl"
            shadow="sm"
          >
            <HStack justify="space-between" mb="3" px="1">
              <Box>
                <Text fontWeight="semibold" fontSize="sm">
                  {DAY_LABELS[day].long}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {items.length === 0
                    ? "Sem aulas"
                    : pluralize(items.length, "aula", "aulas")}
                </Text>
              </Box>

              {onCreate && (
                <Tooltip label="Nova alocação" hasArrow openDelay={300}>
                  <IconButton
                    aria-label={`Nova alocação para ${DAY_LABELS[day].long}`}
                    icon={<Icon as={Plus} boxSize="4" />}
                    size="xs"
                    variant="ghost"
                    onClick={() => onCreate(day)}
                  />
                </Tooltip>
              )}
            </HStack>

            <Stack spacing="2">
              {items.map((allocation) => (
                <ScheduleCard
                  key={allocation.id}
                  allocation={allocation}
                  showProfessor={showProfessor}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}

              {items.length === 0 && (
                <Flex
                  h="16"
                  align="center"
                  justify="center"
                  rounded="lg"
                  borderWidth="1px"
                  borderStyle="dashed"
                  borderColor="border.subtle"
                  fontSize="xs"
                  color="fg.muted"
                >
                  Livre
                </Flex>
              )}
            </Stack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

type ScheduleCardProps = {
  allocation: AllocationView;
  showProfessor: boolean;
  onEdit?: (allocation: AllocationView) => void;
  onDelete?: (allocation: AllocationView) => void;
};

function ScheduleCard({
  allocation,
  showProfessor,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const color = courseColor(allocation.courseId);
  const courseName = allocation.course?.name ?? "Curso removido";
  const minutes = durationInMinutes(allocation.startHour, allocation.endHour);

  return (
    <Box
      p="3"
      rounded="lg"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor={allocation.hasConflict ? "red.400" : "border.subtle"}
      borderLeftWidth="4px"
      borderLeftColor={`${color}.400`}
    >
      <HStack justify="space-between" align="flex-start" spacing="1">
        <HStack
          spacing="1"
          fontSize="xs"
          color="fg.muted"
          fontWeight="medium"
          whiteSpace="nowrap"
        >
          <Icon as={Clock} boxSize="3" />
          <Text>
            {formatHour(allocation.startHour)}–{formatHour(allocation.endHour)}
          </Text>
        </HStack>

        {(onEdit || onDelete) && (
          <Menu placement="bottom-end" isLazy>
            <MenuButton
              as={IconButton}
              aria-label={`Ações da aula de ${courseName}`}
              icon={<Icon as={EllipsisVertical} boxSize="4" />}
              size="xs"
              variant="ghost"
              colorScheme="gray"
              mt="-1"
              mr="-1"
            />
            <MenuList fontSize="sm">
              {onEdit && (
                <MenuItem
                  icon={<Icon as={Pencil} boxSize="4" />}
                  onClick={() => onEdit(allocation)}
                >
                  Editar
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem
                  icon={<Icon as={Trash2} boxSize="4" />}
                  color="red.500"
                  onClick={() => onDelete(allocation)}
                >
                  Excluir
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        )}
      </HStack>

      {allocation.course ? (
        <RouterLink
          to="/courses/$courseId"
          params={{ courseId: allocation.course.id }}
          display="block"
          mt="1"
          fontSize="sm"
          fontWeight="semibold"
          lineHeight="short"
        >
          {courseName}
        </RouterLink>
      ) : (
        <Text mt="1" fontSize="sm" fontWeight="semibold" color="fg.muted">
          {courseName}
        </Text>
      )}

      {showProfessor && (
        <Text mt="0.5" fontSize="xs" color="fg.muted" noOfLines={1}>
          {allocation.professor ? (
            <RouterLink
              to="/professors/$professorId"
              params={{ professorId: allocation.professor.id }}
            >
              {allocation.professor.name}
            </RouterLink>
          ) : (
            "Professor removido"
          )}
        </Text>
      )}

      <HStack mt="2" spacing="1" flexWrap="wrap">
        <Badge colorScheme={color} variant="subtle" fontSize="2xs">
          {formatDuration(minutes)}
        </Badge>
        {allocation.hasConflict && (
          <Badge colorScheme="red" fontSize="2xs">
            Conflito de horário
          </Badge>
        )}
      </HStack>
    </Box>
  );
}
