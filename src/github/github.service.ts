import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../config/config.service';

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async getUserRepositories(username: string = 'Da-Sheng'): Promise<any> {
    try {
      this.logger.log(`获取用户 ${username} 的仓库列表`);

      const response = await 
        axios.get(`${this.githubApiUrl}/users/${username}/repos`, {
          params: {
            sort: 'updated',
            direction: 'desc',
            per_page: 100,
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Blog-Backend-Service',
            ...(this.configService.githubToken && {
              'Authorization': `token ${this.configService.githubToken}`,
            }),
          },
        });

      const repos: any[] = response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        watchers_count: repo.watchers_count,
        size: repo.size,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        topics: repo.topics || [],
        visibility: repo.visibility,
        archived: repo.archived,
        disabled: repo.disabled,
        fork: repo.fork,
      }));

      this.logger.log(`成功获取 ${repos.length} 个仓库`);

      return {
        success: true,
        data: repos,
        message: `成功获取 ${repos.length} 个仓库`,
      };
    } catch (error) {
      this.logger.error('获取GitHub仓库失败:', error.message);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: '用户不存在',
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'GitHub API 请求频率限制，请稍后重试',
        };
      }

      return {
        success: false,
        error: '获取仓库信息失败，请稍后重试',
      };
    }
  }

  async getRepositoryDetails(username: string, repoName: string): Promise<any> {
    try {
      this.logger.log(`获取仓库详情: ${username}/${repoName}`);

      const response = await axios.get(`${this.githubApiUrl}/repos/${username}/${repoName}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Blog-Backend-Service',
            ...(this.configService.githubToken && {
              'Authorization': `token ${this.configService.githubToken}`,
            }),
          },
        })

      const repo = response.data;
      const repoDetails: any = {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        watchers_count: repo.watchers_count,
        size: repo.size,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        topics: repo.topics || [],
        visibility: repo.visibility,
        archived: repo.archived,
        disabled: repo.disabled,
        fork: repo.fork,
      };

      return {
        success: true,
        data: repoDetails,
        message: '成功获取仓库详情',
      };
    } catch (error) {
      this.logger.error('获取仓库详情失败:', error.message);
      
      return {
        success: false,
        error: '获取仓库详情失败，请稍后重试',
      };
    }
  }
} 