import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 02-code-snippet-manager...');

  // Clean
  await prisma.snippetVersion.deleteMany({});
  await prisma.snippetTag.deleteMany({});
  await prisma.snippet.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.folder.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Snippets123!@#', 10);
  const user = await prisma.user.create({
    data: {
      email: 'engineer@tradeo.local',
      name: 'Senior Architect',
      passwordHash,
    },
  });

  const folderWeb = await prisma.folder.create({
    data: {
      name: 'Web Utilities',
      userId: user.id,
    },
  });

  const folderAlgo = await prisma.folder.create({
    data: {
      name: 'Algorithms & Data Structures',
      userId: user.id,
    },
  });

  const tagReact = await prisma.tag.create({
    data: { name: 'react', userId: user.id },
  });

  const tagTypeScript = await prisma.tag.create({
    data: { name: 'typescript', userId: user.id },
  });

  const tagPython = await prisma.tag.create({
    data: { name: 'python', userId: user.id },
  });

  const snippet1 = await prisma.snippet.create({
    data: {
      title: 'useDebounce React Custom Hook',
      description: 'Defers updating state until user stops typing after delayMs',
      language: 'typescript',
      code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
      isFavorite: true,
      isPublic: true,
      folderId: folderWeb.id,
      userId: user.id,
    },
  });

  await prisma.snippetTag.create({
    data: { snippetId: snippet1.id, tagId: tagReact.id },
  });
  await prisma.snippetTag.create({
    data: { snippetId: snippet1.id, tagId: tagTypeScript.id },
  });

  await prisma.snippetVersion.create({
    data: {
      snippetId: snippet1.id,
      versionNumber: 1,
      code: snippet1.code,
      language: snippet1.language,
      title: snippet1.title,
      summary: 'Initial implementation with cleanup timeout',
    },
  });

  const snippet2 = await prisma.snippet.create({
    data: {
      title: 'Fast Binary Search in Python',
      description: 'O(log N) binary search over sorted integer array',
      language: 'python',
      code: `def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      isFavorite: false,
      isPublic: false,
      folderId: folderAlgo.id,
      userId: user.id,
    },
  });

  await prisma.snippetTag.create({
    data: { snippetId: snippet2.id, tagId: tagPython.id },
  });

  console.log('Seeding completed for 02-code-snippet-manager.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
