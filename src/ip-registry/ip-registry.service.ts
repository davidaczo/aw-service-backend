import axios, { AxiosInstance } from 'axios';
import { configService } from '../config/config.service';

class IpRegistryService {
  private readonly api: AxiosInstance;

  constructor() {
    const { url, apiKey } = configService.getIpRegistryConfig();
    this.api = axios.create({
      baseURL: url,
      headers: {
        Authorization: `ApiKey ${apiKey}`,
      },
    });
  }

  async getLocationByIp(ip: string): Promise<{
    country: string | null;
    city: string | null;
  }> {
    let country = null;
    let city = null;
    try {
      if (configService.isProductionApp()) {
        const { data } = await this.api.get(ip);
        country = data.location?.country?.name || null;
        city = data.location?.city || null;
      }
    } catch (error) {
      console.log('Failed to fetch IP info');
      if (!configService.isProductionApp()) {
        console.log(error);
      }
    }
    return { country, city };
  }
}

const ipRegistryService = new IpRegistryService();

export { ipRegistryService, IpRegistryService };
