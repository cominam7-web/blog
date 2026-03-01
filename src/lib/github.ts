const GITHUB_API = 'https://api.github.com';

function getConfig() {
    return {
        owner: process.env.GITHUB_REPO_OWNER || 'cominam7-web',
        repo: process.env.GITHUB_REPO_NAME || 'blog',
        branch: 'master',
        token: process.env.GITHUB_TOKEN || '',
    };
}

async function githubFetch(path: string, options?: RequestInit) {
    const { token } = getConfig();
    const res = await fetch(`${GITHUB_API}${path}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    return res;
}

export async function getFileSha(filePath: string): Promise<string | null> {
    const { owner, repo, branch } = getConfig();
    const res = await githubFetch(
        `/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
}

export async function createOrUpdateFile(
    filePath: string,
    content: string,
    message: string,
    sha?: string | null
): Promise<{ success: boolean; error?: string }> {
    const { owner, repo, branch } = getConfig();
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');

    const body: Record<string, string> = {
        message,
        content: base64Content,
        branch,
    };
    if (sha) body.sha = sha;

    const res = await githubFetch(`/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error('GitHub API error:', res.status, errText);
        return { success: false, error: `GitHub API ${res.status}` };
    }
    return { success: true };
}

export async function getFileContent(filePath: string): Promise<string | null> {
    const { owner, repo, branch } = getConfig();
    const res = await githubFetch(
        `/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function deleteFile(
    filePath: string,
    sha: string,
    message: string
): Promise<{ success: boolean; error?: string }> {
    const { owner, repo, branch } = getConfig();

    const res = await githubFetch(`/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'DELETE',
        body: JSON.stringify({ message, sha, branch }),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error('GitHub delete error:', res.status, errText);
        return { success: false, error: `GitHub API ${res.status}` };
    }
    return { success: true };
}
