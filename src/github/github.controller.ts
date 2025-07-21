import { Controller, Get, Logger, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { GitHubService } from './github.service';

@Controller('api')
export class GitHubController {
  private readonly logger = new Logger(GitHubController.name);

  constructor(private readonly githubService: GitHubService) {}

  @ApiTags('GitHub')
  @ApiOperation({ summary: '获取GitHub仓库列表' })
  @ApiQuery({ name: 'username', required: false, description: 'GitHub用户名' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 500, description: '获取失败' })
  @Get('getGit')
  async getRepositories(@Query('username') username?: string): Promise<any> {
    const targetUsername = username || process.env.GITHUB_USERNAME || 'Da-Sheng';
    
    this.logger.log(`获取GitHub仓库列表: ${targetUsername}`);
    
    try {
      const result = await this.githubService.getUserRepositories(targetUsername);
      return result;
    } catch (error) {
      this.logger.error('获取GitHub仓库失败:', error);
      return {
        success: false,
        error: '服务器内部错误',
      };
    }
  }

  @Get('getGit/:username')
  async getUserRepositories(@Param('username') username: string): Promise<any> {
    this.logger.log(`获取指定用户GitHub仓库列表: ${username}`);
    
    try {
      const result = await this.githubService.getUserRepositories(username);
      return result;
    } catch (error) {
      this.logger.error('获取GitHub仓库失败:', error);
      return {
        success: false,
        error: '服务器内部错误',
      };
    }
  }

  @Get('getGit/:username/:repo')
  async getRepositoryDetails(
    @Param('username') username: string,
    @Param('repo') repo: string,
  ): Promise<any> {
    this.logger.log(`获取仓库详情: ${username}/${repo}`);
    
    try {
      const result = await this.githubService.getRepositoryDetails(username, repo);
      return result;
    } catch (error) {
      this.logger.error('获取仓库详情失败:', error);
      return {
        success: false,
        error: '服务器内部错误',
      };
    }
  }
} 