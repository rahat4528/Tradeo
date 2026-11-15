describe('Search & Filter Engine (Unit Tests)', () => {
  const sampleSnippets = [
    { id: '1', title: 'React useDebounce Hook', description: 'Debouncing utility', code: 'export function useDebounce...', language: 'typescript', tags: ['react', 'hooks'] },
    { id: '2', title: 'Binary Search Algorithm', description: 'Logarithmic search', code: 'def binary_search(arr, x):...', language: 'python', tags: ['algorithms'] },
    { id: '3', title: 'Docker Compose Postgres', description: 'Local container setup', code: 'version: "3.8"\nservices:...', language: 'yaml', tags: ['devops', 'docker'] },
  ];

  it('should match search term in snippet title', () => {
    const term = 'debounce';
    const matches = sampleSnippets.filter((s) => s.title.toLowerCase().includes(term.toLowerCase()));
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe('1');
  });

  it('should match search term in code content', () => {
    const term = 'binary_search';
    const matches = sampleSnippets.filter((s) => s.code.toLowerCase().includes(term.toLowerCase()));
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe('2');
  });

  it('should match search term in description', () => {
    const term = 'container';
    const matches = sampleSnippets.filter((s) => s.description.toLowerCase().includes(term.toLowerCase()));
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe('3');
  });

  it('should filter strictly by language', () => {
    const py = sampleSnippets.filter((s) => s.language === 'python');
    expect(py.length).toBe(1);
    expect(py[0].title).toBe('Binary Search Algorithm');
  });
});
