import { authenticated, entity, text, uuid } from '@microsoft/rayfin-core';

@entity()
@authenticated('*', {
  policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class CtccAction {
  @uuid()
  id!: string;

  @text({ max: 180 })
  title!: string;

  @text({ max: 120 })
  owner!: string;

  @text({ max: 32 })
  dueDate!: string;

  @text({ max: 32 })
  status!: string;

  @text({ max: 400 })
  outcome!: string;

  @text({ max: 140 })
  linkedRecommendationId!: string;

  @text({ max: 120 })
  user_id!: string;
}