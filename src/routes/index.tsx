import {
  Badge,
  Box,
  Code,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  CircleCheck,
  Database,
  Server,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { API_URL, isDemoMode } from "@/api/config";
import { useAcademicData } from "@/api/queries";
import { ButtonLink, RouterLink } from "@/components/links";
import { QueryErrorState } from "@/components/QueryErrorState";
import { StatCard } from "@/components/StatCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  useDocumentTitle();

  return (
    <>
      <Hero />
      <LiveNumbers />
      <Modules />
      <HowItWorks />
      <BackendIntegration />
      <FinalCallToAction />
    </>
  );
}

function Hero() {
  return (
    <Box
      as="section"
      borderBottomWidth="1px"
      borderColor="border.subtle"
      bgGradient="linear(to-b, brand.50, transparent)"
      _dark={{ bgGradient: "linear(to-b, whiteAlpha.50, transparent)" }}
    >
      <Container maxW="7xl" py={{ base: 14, md: 24 }}>
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: 12, lg: 16 }}
          alignItems="center"
        >
          <Stack spacing="6">
            <Badge
              alignSelf="flex-start"
              colorScheme="brand"
              variant="subtle"
              px="3"
              py="1"
              rounded="full"
              fontWeight="medium"
            >
              Projeto de Frontend · Fafire 2026
            </Badge>

            <Heading as="h1" size={{ base: "2xl", md: "3xl" }} lineHeight="1.1">
              Alocação de professores{" "}
              <Text as="span" color="fg.accent">
                sem conflitos de horário
              </Text>
            </Heading>

            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color="fg.muted"
              maxW="xl"
            >
              Cadastre departamentos, cursos e professores e monte a grade
              semanal de aulas. Esta é a interface web do sistema Professor
              Allocation, integrada à API REST em Spring Boot desenvolvida na
              disciplina de backend.
            </Text>

            <Stack direction={{ base: "column", sm: "row" }} spacing="3">
              <ButtonLink
                to="/allocations"
                size="lg"
                rightIcon={<Icon as={ArrowRight} boxSize="5" />}
              >
                Ver grade de alocações
              </ButtonLink>
              <ButtonLink to="/professors" size="lg" variant="outline">
                Gerenciar professores
              </ButtonLink>
            </Stack>

            <Wrap spacing="5" color="fg.muted" fontSize="sm">
              <WrapItem alignItems="center" gap="2">
                <Icon as={ShieldCheck} boxSize="4" color="green.500" />
                Bloqueio de choque de horários
              </WrapItem>
              <WrapItem alignItems="center" gap="2">
                <Icon as={Database} boxSize="4" color="fg.accent" />
                CRUD completo de 4 entidades
              </WrapItem>
            </Wrap>
          </Stack>

          <SchedulePreview />
        </SimpleGrid>
      </Container>
    </Box>
  );
}

const PREVIEW_COLUMNS = [
  {
    day: "Seg",
    classes: [
      { time: "08:00", course: "Desenvolvimento Frontend", color: "blue" },
      { time: "10:00", course: "Desenvolvimento Backend", color: "green" },
      { time: "19:00", course: "Cálculo I", color: "orange" },
    ],
  },
  {
    day: "Ter",
    classes: [
      { time: "08:00", course: "Banco de Dados", color: "purple" },
      { time: "10:00", course: "Engenharia de Software", color: "pink" },
    ],
  },
  {
    day: "Qua",
    classes: [
      { time: "08:00", course: "Estruturas de Dados", color: "cyan" },
      { time: "14:00", course: "Estatística Aplicada", color: "teal" },
      { time: "19:00", course: "Empreendedorismo", color: "yellow" },
    ],
  },
] as const;

/** Ilustração da grade semanal (decorativa). */
function SchedulePreview() {
  return (
    <Box
      aria-hidden="true"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.subtle"
      rounded="2xl"
      shadow="xl"
      p={{ base: 4, md: 6 }}
    >
      <HStack justify="space-between" mb="5">
        <HStack spacing="2">
          <Icon as={CalendarDays} boxSize="5" color="fg.accent" />
          <Text fontWeight="semibold">Grade da semana</Text>
        </HStack>
        <Badge colorScheme="green" display="flex" alignItems="center" gap="1">
          <Icon as={CircleCheck} boxSize="3" />
          Sem conflitos
        </Badge>
      </HStack>

      <SimpleGrid columns={3} spacing="3">
        {PREVIEW_COLUMNS.map((column) => (
          <Stack key={column.day} spacing="2">
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {column.day}
            </Text>
            {column.classes.map((item) => (
              <Box
                key={item.course}
                p="2.5"
                rounded="md"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border.subtle"
                borderLeftWidth="3px"
                borderLeftColor={`${item.color}.400`}
              >
                <Text fontSize="2xs" color="fg.muted">
                  {item.time}
                </Text>
                <Text fontSize="xs" fontWeight="semibold" noOfLines={2}>
                  {item.course}
                </Text>
              </Box>
            ))}
          </Stack>
        ))}
      </SimpleGrid>
    </Box>
  );
}

function LiveNumbers() {
  const {
    departments,
    professors,
    courses,
    allocations,
    isLoading,
    error,
    refetch,
  } = useAcademicData();

  const stats = [
    {
      label: "Departamentos",
      value: departments.length,
      icon: Building2,
      to: "/departments",
    },
    {
      label: "Professores",
      value: professors.length,
      icon: Users,
      to: "/professors",
    },
    { label: "Cursos", value: courses.length, icon: BookOpen, to: "/courses" },
    {
      label: "Alocações",
      value: allocations.length,
      icon: CalendarClock,
      to: "/allocations",
    },
  ] as const;

  return (
    <Container as="section" maxW="7xl" py={{ base: 10, md: 14 }}>
      <SectionTitle
        eyebrow="Em tempo real"
        title="O sistema em números"
        description={
          isDemoMode
            ? "Dados do modo demonstração, salvos no seu navegador."
            : `Dados carregados da API em ${API_URL}.`
        }
      />

      {error ? (
        <QueryErrorState error={error} onRetry={refetch} />
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="4">
          {stats.map((stat) => (
            <RouterLink
              key={stat.to}
              to={stat.to}
              display="block"
              rounded="xl"
              transition="transform 0.15s"
              _hover={{ textDecoration: "none", transform: "translateY(-2px)" }}
            >
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                isLoading={isLoading}
              />
            </RouterLink>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

const MODULES = [
  {
    title: "Alocações",
    description:
      "Monte a grade semanal definindo professor, curso, dia e horário. Choques de horário do mesmo professor são bloqueados.",
    icon: CalendarClock,
    to: "/allocations",
  },
  {
    title: "Professores",
    description:
      "Cadastro com nome, CPF (com máscara e verificação de duplicidade) e departamento, além da grade de cada professor.",
    icon: Users,
    to: "/professors",
  },
  {
    title: "Cursos",
    description:
      "Catálogo de cursos com as aulas da semana, os professores envolvidos e a carga horária de cada um.",
    icon: BookOpen,
    to: "/courses",
  },
  {
    title: "Departamentos",
    description:
      "Estrutura acadêmica da instituição e a lista de professores vinculados a cada departamento.",
    icon: Building2,
    to: "/departments",
  },
] as const;

function Modules() {
  return (
    <Box
      as="section"
      bg="bg.surface"
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Container maxW="7xl" py={{ base: 14, md: 20 }}>
        <SectionTitle
          eyebrow="Funcionalidades"
          title="Quatro módulos, um fluxo completo"
          description="Cada página tem listagem, busca, cadastro, edição, exclusão e página de detalhes."
        />

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="5">
          {MODULES.map((module) => (
            <Flex
              key={module.to}
              direction="column"
              p="6"
              rounded="xl"
              borderWidth="1px"
              borderColor="border.subtle"
              bg="bg.canvas"
            >
              <Flex
                boxSize="11"
                align="center"
                justify="center"
                rounded="lg"
                bg="bg.accent"
                color="fg.accent"
              >
                <Icon as={module.icon} boxSize="5" />
              </Flex>
              <Heading as="h3" size="sm" mt="4">
                {module.title}
              </Heading>
              <Text mt="2" fontSize="sm" color="fg.muted" flex="1">
                {module.description}
              </Text>
              <RouterLink
                to={module.to}
                mt="5"
                display="inline-flex"
                alignItems="center"
                gap="1"
                fontSize="sm"
                fontWeight="semibold"
                color="fg.accent"
              >
                Acessar {module.title.toLowerCase()}
                <Icon as={ArrowRight} boxSize="4" />
              </RouterLink>
            </Flex>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

const STEPS = [
  {
    title: "Estruture a instituição",
    description: "Cadastre os departamentos e os cursos oferecidos.",
  },
  {
    title: "Cadastre os professores",
    description: "Informe nome, CPF e o departamento de cada professor.",
  },
  {
    title: "Monte a grade",
    description:
      "Aloque professores nos cursos por dia e horário; o sistema avisa na hora se houver choque.",
  },
] as const;

function HowItWorks() {
  return (
    <Container as="section" maxW="7xl" py={{ base: 14, md: 20 }}>
      <SectionTitle
        eyebrow="Como funciona"
        title="Da estrutura à grade em três passos"
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="8">
        {STEPS.map((step, index) => (
          <HStack key={step.title} align="flex-start" spacing="4">
            <Flex
              boxSize="10"
              flexShrink={0}
              align="center"
              justify="center"
              rounded="full"
              bg="brand.600"
              color="white"
              fontWeight="bold"
            >
              {index + 1}
            </Flex>
            <Box>
              <Heading as="h3" size="sm">
                {step.title}
              </Heading>
              <Text mt="1" color="fg.muted">
                {step.description}
              </Text>
            </Box>
          </HStack>
        ))}
      </SimpleGrid>
    </Container>
  );
}

const ENTITIES = [
  { name: "DepartmentDTO", fields: ["id: Long", "name: String"] },
  { name: "CourseDTO", fields: ["id: Long", "name: String"] },
  {
    name: "ProfessorDTO",
    fields: [
      "id: Long",
      "name: String",
      "cpf: String (11 dígitos)",
      "departmentId: Long",
    ],
  },
  {
    name: "AllocationDTO",
    fields: [
      "id: Long",
      "dayOfWeek: DayOfWeek",
      "startHour: LocalTime",
      "endHour: LocalTime",
      "professorId: Long",
      "courseId: Long",
    ],
  },
] as const;

const ENDPOINTS = [
  { method: "GET", path: "/{recurso}", color: "green" },
  { method: "GET", path: "/{recurso}/{id}", color: "green" },
  { method: "POST", path: "/{recurso}", color: "blue" },
  { method: "PUT", path: "/{recurso}/{id}", color: "orange" },
  { method: "DELETE", path: "/{recurso}/{id}", color: "red" },
] as const;

const STACK = [
  "React 19",
  "TypeScript",
  "Vite",
  "TanStack Router",
  "TanStack Query",
  "Chakra UI",
  "React Hook Form",
  "Zod",
  "json-server",
] as const;

function BackendIntegration() {
  return (
    <Box
      as="section"
      bg="bg.surface"
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Container maxW="7xl" py={{ base: 14, md: 20 }}>
        <SectionTitle
          eyebrow="Integração"
          title="Feito sobre a API do backend"
          description="Os formulários seguem as mesmas regras dos DTOs e serviços do backend Spring Boot + JPA + MySQL."
        />

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="6">
          <Box gridColumn={{ lg: "span 2" }}>
            <InfoTitle icon={Database}>Modelo de dados</InfoTitle>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="4">
              {ENTITIES.map((entity) => (
                <Box
                  key={entity.name}
                  p="4"
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  bg="bg.canvas"
                >
                  <Text fontWeight="semibold" fontFamily="mono" fontSize="sm">
                    {entity.name}
                  </Text>
                  <Stack as="ul" listStyleType="none" mt="2" spacing="1">
                    {entity.fields.map((field) => (
                      <Text
                        as="li"
                        key={field}
                        fontFamily="mono"
                        fontSize="xs"
                        color="fg.muted"
                      >
                        {field}
                      </Text>
                    ))}
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Stack spacing="6">
            <Box>
              <InfoTitle icon={Server}>Endpoints REST</InfoTitle>
              <Stack spacing="2">
                {ENDPOINTS.map((endpoint) => (
                  <HStack
                    key={`${endpoint.method} ${endpoint.path}`}
                    spacing="3"
                  >
                    <Badge
                      colorScheme={endpoint.color}
                      minW="16"
                      textAlign="center"
                    >
                      {endpoint.method}
                    </Badge>
                    <Code fontSize="xs" bg="transparent">
                      {endpoint.path}
                    </Code>
                  </HStack>
                ))}
              </Stack>
              <Text mt="3" fontSize="xs" color="fg.muted">
                Recursos: departments, courses, professors e allocations.
              </Text>
            </Box>

            <Box>
              <InfoTitle icon={CircleCheck}>Tecnologias do frontend</InfoTitle>
              <Wrap spacing="2">
                {STACK.map((item) => (
                  <WrapItem key={item}>
                    <Tag size="sm" variant="subtle" colorScheme="brand">
                      {item}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

function FinalCallToAction() {
  return (
    <Container as="section" maxW="7xl" py={{ base: 14, md: 20 }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap="6"
        p={{ base: 8, md: 12 }}
        rounded="2xl"
        bg="brand.600"
        color="white"
        shadow="lg"
      >
        <Box>
          <Heading as="h2" size="lg">
            Pronto para montar a grade?
          </Heading>
          <Text mt="2" color="whiteAlpha.900" maxW="xl">
            Comece pelos cadastros ou vá direto para a grade semanal de
            alocações.
          </Text>
        </Box>
        <ButtonLink
          to="/allocations"
          size="lg"
          colorScheme="whiteAlpha"
          bg="white"
          color="brand.700"
          _hover={{ bg: "brand.50" }}
          rightIcon={<Icon as={ArrowRight} boxSize="5" />}
          flexShrink={0}
        >
          Abrir alocações
        </ButtonLink>
      </Flex>
    </Container>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Box mb="8" maxW="2xl">
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color="fg.accent"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {eyebrow}
      </Text>
      <Heading as="h2" size="lg" mt="2">
        {title}
      </Heading>
      {description && (
        <Text mt="2" color="fg.muted">
          {description}
        </Text>
      )}
    </Box>
  );
}

function InfoTitle({
  icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <HStack spacing="2" mb="4">
      <Icon as={icon} boxSize="4" color="fg.accent" />
      <Heading as="h3" size="sm">
        {children}
      </Heading>
    </HStack>
  );
}
