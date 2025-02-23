interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
  statusCode: number;
}

class MockDataProvider {
  private static mockDelay = 500; // Simulate network delay

  static async getMockResponse<T>(
    mockData: T,
    forceError: boolean = false,
    errorProbability: number = 0
  ): Promise<ServiceResponse<T>> {
    // Validate the mock data before returning
    if (!mockData) {
      return {
        data: null,
        error: new Error('Invalid mock data provided'),
        statusCode: 400
      };
    }

    // Deep clone the mock data to prevent mutations
    const safeData = this.safeClone(mockData);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));

    // Simulate random errors if probability is set
    if (errorProbability > 0 && Math.random() < errorProbability) {
      return {
        data: null,
        error: new Error('Simulated random error'),
        statusCode: 500
      };
    }

    // Force error if specified
    if (forceError) {
      return {
        data: null,
        error: new Error('Forced error state'),
        statusCode: 500
      };
    }

    // Return success response
    return {
      data: safeData,
      error: null,
      statusCode: 200
    };
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(operation, retries - 1, delay * 2);
    }
  }

  private static safeClone<T>(obj: T): T {
    try {
      // Handle special cases
      if (!obj || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
      if (Array.isArray(obj)) return obj.map(item => this.safeClone(item)) as unknown as T;

      const clonedObj = {} as T;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clonedObj[key] = this.safeClone(obj[key]);
        }
      }
      return clonedObj;
    } catch (error) {
      console.error('Error cloning mock data:', error);
      return obj; // Return original if cloning fails
    }
  }

  static validateArrayData<T>(data: T[] | null | undefined): T[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data;
  }

  static ensureNumber(value: number | null | undefined, defaultValue: number = 0): number {
    if (typeof value !== 'number' || isNaN(value)) {
      return defaultValue;
    }
    return value;
  }
}

export { MockDataProvider };
export type { ServiceResponse };