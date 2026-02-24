import { Request, Response, NextFunction } from 'express';
export declare class OrderController {
    static createOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOrderById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static processPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPharmacyOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    static assignDeliveryPartner(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDeliveryTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    static generateInvoice(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDeliveryPartnerOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=order.controller.d.ts.map