export class MockPrismaService {
  private users: any[] = [];
  private folders: any[] = [];
  private snippets: any[] = [];
  private tags: any[] = [];
  private snippetTags: any[] = [];
  private snippetVersions: any[] = [];

  user = {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.id) return this.users.find((u) => u.id === where.id) || null;
      if (where.email) return this.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      return null;
    }),
    create: jest.fn(async ({ data }: any) => {
      const u = { id: `user-${Date.now()}-${Math.random()}`, createdAt: new Date(), updatedAt: new Date(), ...data };
      this.users.push(u);
      return u;
    }),
  };

  folder = {
    findUnique: jest.fn(async ({ where }: any) => {
      return this.folders.find((f) => f.id === where.id) || null;
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      return this.folders.find((f) => (!where.id || f.id === where.id) && (!where.userId || f.userId === where.userId) && (!where.name || f.name === where.name)) || null;
    }),
    findMany: jest.fn(async ({ where }: any) => {
      let filtered = [...this.folders];
      if (where?.userId) filtered = filtered.filter((f) => f.userId === where.userId);
      return filtered.map((f) => ({
        ...f,
        _count: {
          snippets: this.snippets.filter((s) => s.folderId === f.id).length,
          children: this.folders.filter((cf) => cf.parentId === f.id).length,
        },
      }));
    }),
    create: jest.fn(async ({ data }: any) => {
      const f = { id: `folder-${Date.now()}-${Math.random()}`, createdAt: new Date(), updatedAt: new Date(), ...data };
      this.folders.push(f);
      return { ...f, _count: { snippets: 0, children: 0 } };
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = this.folders.findIndex((f) => f.id === where.id);
      if (idx === -1) throw new Error('Folder not found');
      this.folders[idx] = { ...this.folders[idx], ...data, updatedAt: new Date() };
      return { ...this.folders[idx], _count: { snippets: 0, children: 0 } };
    }),
    delete: jest.fn(async ({ where }: any) => {
      const idx = this.folders.findIndex((f) => f.id === where.id);
      if (idx === -1) throw new Error('Folder not found');
      // Set folderId to null on associated snippets
      this.snippets.forEach((s) => {
        if (s.folderId === where.id) s.folderId = null;
      });
      return this.folders.splice(idx, 1)[0];
    }),
  };

  snippet = {
    findUnique: jest.fn(async ({ where, include }: any) => {
      const s = this.snippets.find((item) => item.id === where.id);
      if (!s) return null;
      return this.attachSnippetIncludes(s, include);
    }),
    findMany: jest.fn(async ({ where, skip = 0, take = 50, include }: any) => {
      let filtered = [...this.snippets];
      if (where?.userId) filtered = filtered.filter((s) => s.userId === where.userId);
      if (where?.isFavorite !== undefined) filtered = filtered.filter((s) => s.isFavorite === where.isFavorite);
      if (where?.language) filtered = filtered.filter((s) => s.language === where.language);
      if (where?.folderId !== undefined) filtered = filtered.filter((s) => s.folderId === where.folderId);
      if (where?.OR) {
        filtered = filtered.filter((s) => {
          const term = where.OR[0]?.title?.contains?.toLowerCase();
          if (!term) return true;
          return (
            s.title.toLowerCase().includes(term) ||
            (s.description && s.description.toLowerCase().includes(term)) ||
            s.code.toLowerCase().includes(term)
          );
        });
      }
      if (where?.tags?.some?.tag?.name) {
        const tagName = where.tags.some.tag.name;
        const matchingTag = this.tags.find((t) => t.name === tagName);
        if (matchingTag) {
          const validSnippetIds = this.snippetTags
            .filter((st) => st.tagId === matchingTag.id)
            .map((st) => st.snippetId);
          filtered = filtered.filter((s) => validSnippetIds.includes(s.id));
        } else {
          filtered = [];
        }
      }
      return filtered.slice(skip, skip + take).map((s) => this.attachSnippetIncludes(s, include));
    }),
    count: jest.fn(async ({ where }: any) => {
      let filtered = [...this.snippets];
      if (where?.userId) filtered = filtered.filter((s) => s.userId === where.userId);
      if (where?.isFavorite !== undefined) filtered = filtered.filter((s) => s.isFavorite === where.isFavorite);
      return filtered.length;
    }),
    create: jest.fn(async ({ data }: any) => {
      const s = {
        id: `snippet-${Date.now()}-${Math.random()}`,
        isFavorite: false,
        isPublic: false,
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.snippets.push(s);
      return s;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = this.snippets.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error('Snippet not found');
      this.snippets[idx] = { ...this.snippets[idx], ...data, updatedAt: new Date() };
      return this.snippets[idx];
    }),
    delete: jest.fn(async ({ where }: any) => {
      const idx = this.snippets.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error('Snippet not found');
      const deleted = this.snippets.splice(idx, 1)[0];
      this.snippetVersions = this.snippetVersions.filter((v) => v.snippetId !== where.id);
      this.snippetTags = this.snippetTags.filter((st) => st.snippetId !== where.id);
      return deleted;
    }),
  };

  tag = {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.userId_name) {
        return (
          this.tags.find(
            (t) => t.userId === where.userId_name.userId && t.name === where.userId_name.name,
          ) || null
        );
      }
      return null;
    }),
    findMany: jest.fn(async ({ where }: any) => {
      let filtered = [...this.tags];
      if (where?.userId) filtered = filtered.filter((t) => t.userId === where.userId);
      return filtered.map((t) => ({
        ...t,
        _count: {
          snippets: this.snippetTags.filter((st) => st.tagId === t.id).length,
        },
      }));
    }),
    create: jest.fn(async ({ data }: any) => {
      const t = { id: `tag-${Date.now()}-${Math.random()}`, createdAt: new Date(), ...data };
      this.tags.push(t);
      return t;
    }),
  };

  snippetTag = {
    create: jest.fn(async ({ data }: any) => {
      this.snippetTags.push(data);
      return data;
    }),
    deleteMany: jest.fn(async ({ where }: any) => {
      if (where?.snippetId) {
        this.snippetTags = this.snippetTags.filter((st) => st.snippetId !== where.snippetId);
      }
      return { count: 1 };
    }),
  };

  snippetVersion = {
    findUnique: jest.fn(async ({ where }: any) => {
      return this.snippetVersions.find((v) => v.id === where.id) || null;
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let filtered = this.snippetVersions.filter((v) => v.snippetId === where.snippetId);
      if (orderBy?.versionNumber === 'desc') {
        filtered.sort((a, b) => b.versionNumber - a.versionNumber);
      }
      return filtered;
    }),
    create: jest.fn(async ({ data }: any) => {
      const v = { id: `ver-${Date.now()}-${Math.random()}`, createdAt: new Date(), ...data };
      this.snippetVersions.push(v);
      return v;
    }),
    deleteMany: jest.fn(async () => ({ count: 0 })),
  };

  private attachSnippetIncludes(snippet: any, include?: any) {
    const res = { ...snippet };
    if (include?.folder) {
      const folder = this.folders.find((f) => f.id === snippet.folderId);
      res.folder = folder ? { id: folder.id, name: folder.name } : null;
    }
    if (include?.tags) {
      const relatedTags = this.snippetTags
        .filter((st) => st.snippetId === snippet.id)
        .map((st) => ({
          tag: this.tags.find((t) => t.id === st.tagId),
        }));
      res.tags = relatedTags;
    }
    if (include?.versions) {
      res.versions = this.snippetVersions
        .filter((v) => v.snippetId === snippet.id)
        .sort((a, b) => b.versionNumber - a.versionNumber);
    }
    if (include?._count) {
      res._count = {
        versions: this.snippetVersions.filter((v) => v.snippetId === snippet.id).length,
      };
    }
    return res;
  }

  reset() {
    this.users = [];
    this.folders = [];
    this.snippets = [];
    this.tags = [];
    this.snippetTags = [];
    this.snippetVersions = [];
  }
}
