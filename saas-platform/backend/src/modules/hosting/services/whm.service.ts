import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface CreateAccountRequest {
  username: string;
  domain: string;
  password: string;
  email: string;
  plan?: string;
}

export interface WHMResponse<T = any> {
  status: number;
  statusmsg: string;
  data?: T;
}

@Injectable()
export class WHMService {
  private readonly logger = new Logger(WHMService.name);
  private whmClient: AxiosInstance;
  private whmHost: string;
  private whmUsername: string;
  private whmApiToken: string;

  constructor(private configService: ConfigService) {
    this.whmHost = this.configService.get('WHM_HOST', 'localhost');
    this.whmUsername = this.configService.get('WHM_USERNAME', 'root');
    this.whmApiToken = this.configService.get('WHM_API_TOKEN', '');

    const whmUrl = `https://${this.whmHost}:2087`;

    this.whmClient = axios.create({
      baseURL: whmUrl,
      auth: {
        username: this.whmUsername,
        password: this.whmApiToken,
      },
      httpsAgent: { rejectUnauthorized: false },
      validateStatus: () => true, // Accept all status codes
    });
  }

  /**
   * Create a new hosting account
   */
  async createAccount(request: CreateAccountRequest): Promise<any> {
    try {
      this.logger.debug(`Creating WHM account: ${request.username}`);

      const response = await this.whmClient.post('/json-api/createacct', null, {
        params: {
          username: request.username,
          domain: request.domain,
          password: request.password,
          email: request.email,
          plan: request.plan || 'default',
        },
      });

      if (response.status === 200 && response.data.status === 1) {
        this.logger.log(`Successfully created account: ${request.username}`);
        return {
          success: true,
          data: response.data,
          accountName: request.username,
        };
      }

      throw new BadRequestException(
        response.data.statusmsg || 'Failed to create account',
      );
    } catch (error) {
      this.logger.error(
        `Failed to create WHM account: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `WHM Error: ${error.message || 'Failed to create account'}`,
      );
    }
  }

  /**
   * Suspend an account
   */
  async suspendAccount(username: string, reason?: string): Promise<any> {
    try {
      this.logger.debug(`Suspending WHM account: ${username}`);

      const response = await this.whmClient.post(
        '/json-api/suspendacct',
        null,
        {
          params: {
            user: username,
            reason: reason || 'Administrative suspension',
          },
        },
      );

      if (response.status === 200) {
        this.logger.log(`Successfully suspended account: ${username}`);
        return { success: true, data: response.data };
      }

      throw new BadRequestException(response.data.statusmsg);
    } catch (error) {
      this.logger.error(`Failed to suspend account: ${error.message}`);
      throw new BadRequestException(
        `Failed to suspend account: ${error.message}`,
      );
    }
  }

  /**
   * Unsuspend an account
   */
  async unsuspendAccount(username: string): Promise<any> {
    try {
      this.logger.debug(`Unsuspending WHM account: ${username}`);

      const response = await this.whmClient.post(
        '/json-api/unsuspendacct',
        null,
        {
          params: { user: username },
        },
      );

      if (response.status === 200) {
        this.logger.log(`Successfully unsuspended account: ${username}`);
        return { success: true, data: response.data };
      }

      throw new BadRequestException(response.data.statusmsg);
    } catch (error) {
      this.logger.error(`Failed to unsuspend account: ${error.message}`);
      throw new BadRequestException(
        `Failed to unsuspend account: ${error.message}`,
      );
    }
  }

  /**
   * Remove an account
   */
  async removeAccount(
    username: string,
    keepDns: boolean = false,
  ): Promise<any> {
    try {
      this.logger.debug(`Removing WHM account: ${username}`);

      const response = await this.whmClient.post('/json-api/removeacct', null, {
        params: {
          user: username,
          keepdns: keepDns ? 1 : 0,
        },
      });

      if (response.status === 200) {
        this.logger.log(`Successfully removed account: ${username}`);
        return { success: true, data: response.data };
      }

      throw new BadRequestException(response.data.statusmsg);
    } catch (error) {
      this.logger.error(`Failed to remove account: ${error.message}`);
      throw new BadRequestException(
        `Failed to remove account: ${error.message}`,
      );
    }
  }

  /**
   * List all accounts
   */
  async listAccounts(): Promise<any> {
    try {
      this.logger.debug('Listing WHM accounts');

      const response = await this.whmClient.get('/json-api/listaccts');

      if (response.status === 200 && response.data.status === 1) {
        return response.data.data || [];
      }

      throw new BadRequestException(
        response.data.statusmsg || 'Failed to list accounts',
      );
    } catch (error) {
      this.logger.error(`Failed to list accounts: ${error.message}`);
      throw new BadRequestException(
        `Failed to list accounts: ${error.message}`,
      );
    }
  }

  /**
   * Create a cPanel session (for SSO)
   */
  async createUserSession(username: string): Promise<string> {
    try {
      this.logger.debug(`Creating cPanel session for: ${username}`);

      const response = await this.whmClient.get('/json-api/create_user_session', {
        params: { username },
      });

      if (response.status === 200 && response.data.status === 1) {
        return response.data.session;
      }

      throw new BadRequestException('Failed to create session');
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw new BadRequestException(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(username: string): Promise<any> {
    try {
      this.logger.debug(`Getting account details for: ${username}`);

      const response = await this.whmClient.get('/json-api/accountsummary', {
        params: { user: username },
      });

      if (response.status === 200) {
        return response.data;
      }

      throw new BadRequestException('Failed to get account details');
    } catch (error) {
      this.logger.error(`Failed to get account details: ${error.message}`);
      throw new BadRequestException(
        `Failed to get account details: ${error.message}`,
      );
    }
  }

  /**
   * Change account password
   */
  async changePassword(username: string, password: string): Promise<any> {
    try {
      this.logger.debug(`Changing password for: ${username}`);

      const response = await this.whmClient.post('/json-api/passwd', null, {
        params: { user: username, password },
      });

      if (response.status === 200 && response.data.status === 1) {
        this.logger.log(`Successfully changed password for: ${username}`);
        return { success: true };
      }

      throw new BadRequestException(response.data.statusmsg);
    } catch (error) {
      this.logger.error(`Failed to change password: ${error.message}`);
      throw new BadRequestException(
        `Failed to change password: ${error.message}`,
      );
    }
  }

  /**
   * Get resource usage for an account
   */
  async getAccountUsage(username: string): Promise<any> {
    try {
      const response = await this.whmClient.get('/json-api/accountsummary', {
        params: { user: username },
      });

      if (response.status === 200) {
        return {
          diskUsage: response.data.disk_used || 0,
          bandwidthUsage: response.data.bandwidth_used || 0,
          status: response.data.status || 'active',
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get usage: ${error.message}`);
      return null;
    }
  }
}
