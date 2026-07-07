import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { ServiceItem } from "../types";
import { formatPrice } from "../utils";

interface Props {
  service: ServiceItem;
}

export default function ServiceCard({ service }: Props) {
  return (
    <Link
      to={`/services/${service.serviceId}`}
      className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{service.serviceName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{service.merchantName}</p>
        </div>
        <span className="shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
          {service.category}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{service.description}</p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-medium text-gray-700">{service.rating}</span>
          <span className="text-gray-400">({service.reviewCount})</span>
        </div>
        <span className="font-bold text-blue-600">{formatPrice(service.price)}</span>
      </div>
    </Link>
  );
}
