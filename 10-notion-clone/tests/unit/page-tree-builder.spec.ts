describe('Page Tree Hierarchy Builder (Unit)', () => {
  interface FlatPage {
    id: string;
    title: string;
    parentId: string | null;
  }

  interface TreeNode extends FlatPage {
    children: TreeNode[];
  }

  function buildTree(pages: FlatPage[]): TreeNode[] {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    for (const p of pages) {
      map.set(p.id, { ...p, children: [] });
    }

    for (const p of pages) {
      const node = map.get(p.id)!;
      if (p.parentId && map.has(p.parentId)) {
        map.get(p.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  it('builds multi-level nested page hierarchy correctly', () => {
    const flat: FlatPage[] = [
      { id: '1', title: 'Engineering Handbook', parentId: null },
      { id: '2', title: 'Architecture Standards', parentId: '1' },
      { id: '3', title: 'Backend Conventions', parentId: '2' },
      { id: '4', title: 'Product Roadmap', parentId: null },
    ];

    const tree = buildTree(flat);

    expect(tree).toHaveLength(2); // Two root nodes: Handbook & Roadmap
    expect(tree[0].id).toBe('1');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe('2');
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].id).toBe('3');
    expect(tree[1].id).toBe('4');
    expect(tree[1].children).toHaveLength(0);
  });
});
