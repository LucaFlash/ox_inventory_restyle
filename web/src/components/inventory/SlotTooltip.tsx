import { Inventory, SlotWithItem } from '../../typings';
import React, { Fragment, useMemo } from 'react';
import { Items } from '../../store/items';
import { Locale } from '../../store/locale';
import ReactMarkdown from 'react-markdown';
import { useAppSelector } from '../../store';
import ClockIcon from '../utils/icons/ClockIcon';
import { getItemUrl } from '../../helpers';
import Divider from '../utils/Divider';

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'comune':
      return '#A6E519'; // Verde senza opacità
    case 'raro':
      return '#00FFFF'; // Ciano senza opacità
    case 'epico':
      return '#CD00CD'; // Viola senza opacità
    case 'leggendario':
      return '#FFD700'; // Oro senza opacità
    case 'speciale':
      return '#FFFFFF'; // Bianco senza opacità
    default:
      return '#000000'; // Nero senza opacità
  }
};

const getRarityColorBG = (rarity: string) => {
  switch (rarity) {
    case 'comune':
      return '#0080001A'; // Verde con 10% di opacità
    case 'raro':
      return '#00FFFF1A'; // Ciano con 10% di opacità
    case 'epico':
      return '#8000801A'; // Viola con 10% di opacità
    case 'leggendario':
      return '#FFD7001A'; // Oro con 10% di opacità
    case 'speciale':
      return '#DC23671A'; // Bianco con 10% di opacità
    default:
      return '#0000001A'; // Nero con 10% di opacità
  }
};

const SlotTooltip: React.ForwardRefRenderFunction<
  HTMLDivElement,
  { item: SlotWithItem; inventoryType: Inventory['type']; style: React.CSSProperties }
> = ({ item, inventoryType, style }, ref) => {
  const additionalMetadata = useAppSelector((state) => state.inventory.additionalMetadata);
  const itemData = useMemo(() => Items[item.name], [item]);
  const ingredients = useMemo(() => {
    if (!item.ingredients) return null;
    return Object.entries(item.ingredients).sort((a, b) => a[1] - b[1]);
  }, [item]);
  const description = item.metadata?.description || itemData?.description;
  const ammoName = itemData?.ammoName && Items[itemData?.ammoName]?.label;

  return (
    <>
      {!itemData ? (
        <div className="tooltip-wrapper" ref={ref} style={style}>
          <div className="tooltip-header-wrapper">
            <p>{item.name}</p>
          </div>
          <Divider />
          {item.rarity && (
            <span
              className="rarity"
              style={{ 
                color: getRarityColor(item.rarity),
                backgroundColor: getRarityColorBG(item.rarity),
              }}
            >
              {item.rarity || 'Non rilevato'}
            </span>
          )}
          
        </div>
      ) : (
        <div style={{ ...style }} className="tooltip-wrapper" ref={ref}>
          <div className="tooltip-header-wrapper">
            <p>{item.metadata?.label || itemData.label || item.name}</p>
            {inventoryType === 'crafting' ? (
              <div className="tooltip-crafting-duration">
                <ClockIcon />
                <p>{(item.duration !== undefined ? item.duration : 3000) / 1000}s</p>
              </div>
            ) : (
              <p>{item.metadata?.type}</p>
            )}
          </div>
          <Divider />
          {item.rarity && (
            <span
              className="rarity"
              style={{ 
                color: getRarityColor(item.rarity),
                backgroundColor: getRarityColorBG(item.rarity),
                
              }}
            >
              {item.rarity || 'Non rilevato'}
            </span>
          )}
          
          {description && (
            <div className="tooltip-description">
              <ReactMarkdown className="tooltip-markdown">{description}</ReactMarkdown>
            </div>
          )}
          {inventoryType !== 'crafting' ? (
            <>
              {item.durability !== undefined && (
                <p>
                  {Locale.ui_durability}: {Math.trunc(item.durability)}
                </p>
              )}
              {item.metadata?.ammo !== undefined && (
                <p>
                  {Locale.ui_ammo}: {item.metadata.ammo}
                </p>
              )}
              {ammoName && (
                <p>
                  {Locale.ammo_type}: {ammoName}
                </p>
              )}
              {item.metadata?.serial && (
                <p>
                  {Locale.ui_serial}: {item.metadata.serial}
                </p>
              )}
              {item.metadata?.components && item.metadata?.components[0] && (
                <p>
                  {Locale.ui_components}:{' '}
                  {(item.metadata?.components).map((component: string, index: number, array: []) =>
                    index + 1 === array.length ? Items[component]?.label : Items[component]?.label + ', '
                  )}
                </p>
              )}
              {item.metadata?.weapontint && (
                <p>
                  {Locale.ui_tint}: {item.metadata.weapontint}
                </p>
              )}
              {additionalMetadata.map((data: { metadata: string; value: string }, index: number) => (
                <Fragment key={`metadata-${index}`}>
                  {item.metadata && item.metadata[data.metadata] && (
                    <p>
                      {data.value}: {item.metadata[data.metadata]}
                    </p>
                  )}
                </Fragment>
              ))}
            </>
          ) : (
            <div className="tooltip-ingredients">
              {ingredients &&
                ingredients.map((ingredient) => {
                  const [item, count] = [ingredient[0], ingredient[1]];
                  return (
                    <div className="tooltip-ingredient" key={`ingredient-${item}`}>
                      <img src={item ? getItemUrl(item) : 'none'} alt="item-image" />
                      <p>
                        {count >= 1
                          ? `${count}x ${Items[item]?.label || item}`
                          : count === 0
                          ? `${Items[item]?.label || item}`
                          : count < 1 && `${count * 100}% ${Items[item]?.label || item}`}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default React.forwardRef(SlotTooltip);
